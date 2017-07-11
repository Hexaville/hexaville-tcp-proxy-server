const net = require('net');
const mysql = require('mysql');
const _ = require('lodash');
const ConnectionPool = require('jackpot');
const log4js = require('log4js');
const logger = log4js.getLogger();
logger.level = 'debug';

process.on("uncaughtException", function(error) {
  logger.fatal(error);
});

class TCPProxyServer {
  constructor(opts) {
    this.remoteHost = opts.remoteHost || 'localhost';
    this.remotePort = opts.remotePort || 3306;
    const defaultPoolSize = opts.pool.default || 10;;
    const minPoolSize = opts.pool.min || 10;
    const maxPoolSize = opts.pool.max || 10;

    this._pool = new ConnectionPool(defaultPoolSize, {min: minPoolSize, max: maxPoolSize});

    this._pool.factory(() => {
      const socket = new net.Socket();
      return socket.connect(this.remotePort, this.remoteHost);
    });

    this._server = net.createServer((clientSocket) => {
      this._pool.pull((err, remoteSocket) => {
        clientSocket.on('data', (data) => {
          logger.debug(`${clientSocket.remoteAddress}:${clientSocket.remotePort} - writing data to remote`);
          const flushed = remoteSocket.write(data);
          if (!flushed) {
            logger.debug("  remote not flushed; pausing local");
            clientSocket.pause();
          }
        });

        remoteSocket.on('data', (data) => {
          logger.debug(`${clientSocket.remoteAddress}:${clientSocket.remotePort} - writing data to local`);
          const flushed = clientSocket.write(data);
          if (!flushed) {
            logger.debug("  local not flushed; pausing remote");
            remoteSocket.pause();
          }
        });

        clientSocket.on('drain', () => {
          logger.debug(`${clientSocket.remoteAddress}:${clientSocket.remotePort} - resuming remote`);
          remoteSocket.resume();
        });

        remoteSocket.on('drain', () => {
          logger.debug(`${clientSocket.remoteAddress}:${clientSocket.remotePort} - resuming local`);
          clientSocket.resume();
        });

        clientSocket.on('close', (had_error) => {
          logger.debug(`${clientSocket.remoteAddress}:${clientSocket.remotePort} - closing remote`);
          remoteSocket.end();
        });

        remoteSocket.on('close', (had_error) => {
          logger.debug(`${clientSocket.remoteAddress}:${clientSocket.remotePort} - closing local`);
          clientSocket.end();
        });
      });
    });
  }

  listen (listeningPort){
    this._server.listen(listeningPort);
    logger.debug(`redirecting connections from 127.0.0.1:${listeningPort} to ${this.remoteHost}:${this.remotePort}`);
  }
}

module.exports = TCPProxyServer;
