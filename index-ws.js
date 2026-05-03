const express = require('express');
const server = require('http').createServer();
const app = express();

app.get('/', (req, res) => {
  res.sendFile('index.html', { root: __dirname }); // dirname in Node means CURRENT DIRECTORY of the file 
});

server.on('request', app);
server.listen(3000, () => {
  console.log('Server is listening on port 3000');
});


/** Begin Websockets */
const WebsocketsServer = require('ws').Server;

// attaches websocket server to existing server // server: existingExpressServer - the second server name is the name of the express server
// the first one is the websocket server
const wss = new WebsocketsServer({server: server}); // server is the server on line 10

// listeners

// when they first connect, runs callbackfxn connection every time it connects
wss.on('connection', function connection(ws) {
    const numClients = wss.clients.size;
    console.log('Clients connected: ', numClients);

    // broadcast sends message to everyone connected rather than iterate through them all
    wss.broadcast('Current visitors: ', numClients);

    if (ws.readyState === ws.OPEN) {
        ws.send('Welcome to my server')
    }

    ws.on('close', function close() {
        console.log('Client has disconnected');
    });
})

// loops through all connected users and send some data
wss.broadcast = function broadcast(data) {
    wss.clients.forEach(function each(client) {
        client.send(data);
    })
}