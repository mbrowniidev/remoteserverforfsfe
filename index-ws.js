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

// sigint is CTRL+C, the thing we do when we want to stop things
process.on('SIGINT', () => {
    // loop through clients and shut down websocket b/c websocket will keep server open
    wss.clients.forEach(function each(client) {
        client.close();
    })
    // close server gracefully, closes up any loose connections
    server.close(() => {
        // close down database
        shutdownDB();
    });
}) 

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

    // 'insert' puts things into DB
    // INSERT INTO - telling which fields you want to insert values
    // VALUES () - putting actual values into the fields you listed respectively, use commas between values
    // datetime is function so all lowercase
    db.run(`INSERT INTO visitors (count, time) 
        VALUES(${numClients}, datetime('now'))
    `)

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

//END Websockets


// BEGIN DATABASE

const sqlite = require('sqlite3');

// creates this in memoery
// b/c in memory, when you restart server it will delete everything
const db = new sqlite.Database(':memory:');
// serialize() - ensures that table are setup before you query
db.serialize(() => {
    // run() - lets you run SQL query
    // ( ) means create field, must give type
    db.run(`
        CREATE TABLE visitors (
            count INTEGER,
            time TEXT
            
        )
    `)
})

// sqlite.Database('./fsfe.db') - if you want to write to a file, doesn't have to use db extension, it is tell it is a thing
// PREPARED STATEMENTS - 
// never run SQL directly

function getCounts() {
    // use each to get output from every row in table
    // * - give me every field in that row
    db.each("SELECT * FROM visitors", (err, row) => {
        console.log(row);
    } )
}

// never leave db open - close db connection when you're done
// similar to server request - must end tell server to end connection
function shutdownDB() {
    getCounts();
    console.log('shutting down db');
    db.close();
}