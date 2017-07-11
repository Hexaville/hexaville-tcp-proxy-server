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

proxy.listen(3000);
