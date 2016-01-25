/*!
 *   淘小杰 <308512341@qq.com> (https://github.com/hustxiaoc)
 */
'use strict';
const net = require('net');
const Client = require('./client');
const EventEmitter = require('events');

class Server extends EventEmitter{
    constructor() {
        super();
        this.server = net.createServer((socket)=> this.handleConnection(socket));
    }

    listen(port, callback) {
        this.server.listen(port, callback);
    }

    handleConnection(socket) {
        const client = new Client({
            socket: socket
        });
        socket.on('error', (err) => {
            console.log(err);
        });
        this.emit('connect', client);
        client.on('message', (message) => {
           this.handleRequest(message, client);
        });
    }

    handleRequest(message, client) {
        this.emit('message', message, client);
    }
}

module.exports = Server;