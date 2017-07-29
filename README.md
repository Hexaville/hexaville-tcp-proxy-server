# hexaville-tcp-proxy-server

A TCP Proxy Sever that can pool remote connections

## Synopsis

hexaville-tcp-proxy-server is aimed to develop to prevent enormous number of connections between middleware and functions(serverless
execution unit. such as lambda) when building web applications using serverless computing.


```
            +-----------+   tcp
client ---- | functions | ------------+                            
            +-----------+             |                                    pooled tcp                            
                                   +------------------------------------+  connections  +--------------+
                                   |                                    | ------------- |              |
            +-----------+   tcp    |                                    |               |              | 
client ---- | functions | -------- | hexaville-tcp-proxy-server-cluster | ------------- |   DataBase   |
            +-----------+          |                                    |               |              |
                                   |                                    | ------------- |              |
                                   +------------------------------------+               +--------------+
            +-----------+   tcp       |
client ---- | functions |-------------+
            +-----------+                        
```

## Installation
```
npm i hexaville-tcp-proxy-server
```

## Usage

### Listening up Proxy Server with remote connections pooling.
```js
const ProxyServer = require('hexaville-tcp-proxy-server');

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
```

### Client
```js
yourMysqlClient.connect("host.com", 3306, "foo_database");

yourMysqlClient.query("select * from foo where id = 1").then((data) =>{
  console.log(data);
});
```
