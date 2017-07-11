const mysql = require('mysql');
const assert = require('assert');
const ProxyServer = require('../lib/server');

const proxy = new ProxyServer({
  remoteHost: 'localhost',
  remotePort: 3306,
  pool: {
    default: 10,
    min: 3,
    max: 10
  }
});

proxy.listen(8001);

describe('TCPProxyServer Test', function() {
  it('should commit transaction through proxy', function(done) {
    const connection = mysql.createConnection({
      host: 'localhost',
      port: 8001,
      user: 'root'
    });

    connection.beginTransaction(function(err) {
      if (err) {
        return done(error);
      }

      connection.query('SELECT 1 + 1 AS solution', function (error, results, fields) {
        if (error) {
          return connection.rollback(function() {
            done(error);
          });
        }

        connection.query('SELECT 1 + 1 AS solution', function (error, results, fields) {
          if (error) {
            return connection.rollback(function() {
              done(error);
            });
          }

          connection.commit(function(err) {
            if (err) {
              return connection.rollback(function() {
                done(error);
              });
            }

            connection.end();
            done();
          });
        });
      });
    });
  });
});
