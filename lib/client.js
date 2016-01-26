/*!
 *   淘小杰 <308512341@qq.com> (https://github.com/hustxiaoc)
 */
'use strict';
const path = require('path');
const net = require('net');
const Parser = require('./parser');
const EventEmitter = require('events');
const os = require('os');
const tmpDir = os.tmpDir();
let sockPath = path.join(tmpDir, 'midway.sock');

if (process.platform === 'win32') {
    sockPath = sockPath.replace(/^\//, '');
    sockPath = sockPath.replace(/\//g, '-');
    sockPath = '\\\\.\\pipe\\' + sockPath;
}

class Client extends EventEmitter{
    constructor(options) {
        options = options || {};
        super();
        if (options.socket) {
            this.socket = options.socket;
        } else {
            this.socket = net.connect(sockPath);
        }
        this.bind();
    }

    bind() {
        const parser = new Parser();
        const socket = this.socket;
        socket.on('data', (buf) => {
            parser.feed(buf);
        });

        parser.on('message', (message) => {
            this.emit('message', message);
        });
        this.parser = parser;
    }

    send(message) {
        this.socket.write(this.parser.encode(message));
    }
}

module.exports = Client;
