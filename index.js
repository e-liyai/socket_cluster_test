const http = require('http');
const socketClusterServer = require('socketcluster-server');

let options = {};

let httpServer = http.createServer((req, res) => {
  console.log(req.url);
  res.end('socket cluster test');
});

let agServer = socketClusterServer.attach(httpServer, options);

console.log('----------- INITIALIZING SERVER -----------');

(async () => {
    // Handle new inbound sockets.
    for await (let {socket} of agServer.listener('connection')) {
  
      (async () => {
        // Set up a loop to handle and respond to RPCs for a procedure.
        for await (let req of socket.procedure('customProc')) {
          if (req.data.bad) {
            let error = new Error('Server failed to execute the procedure');
            error.name = 'BadCustomError';
            req.error(error);
          } else {
            req.end('Success');
          }
        }
      })();
  
      (async () => {
        // Set up a loop to handle remote transmitted events.
        for await (let data of socket.receiver('customRemoteEvent')) {
          console.log('Data: ', data)
        }
      })();
  
    }
  })();

  httpServer.listen(8080);
  console.log('----------- RUNNING ON 8080 -----------');