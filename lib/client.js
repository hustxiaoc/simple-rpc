/*!
 *   淘小杰 <308512341@qq.com> (https://github.com/hustxiaoc)
 */
'use strict';
const net = require('net');
const Parser = require('./parser');
const EventEmitter = require('events');

class Client extends EventEmitter{
    constructor(options) {
        super();
        if (options.socket) {
            this.socket = options.socket;
        } else {
            this.socket = net.connect(options.port, options.host);
        }

        this._needDrain = false;
        this._queue = [];
        this.bind();
    }

    _resume() {
        let message = this._queue.shift();
        while (message) {
            this.send(message);
            message = this._queue.shift();
        }
    }

    bind() {
        const parser = new Parser();
        const socket = this.socket;
        socket.setNoDelay(true);

        socket.on('data', (buf) => {
            parser.feed(buf);
        });

        parser.on('message', (message) => {
            this.emit('message', message);
        });
        this.parser = parser;
    }

    send(message) {
        return this.socket.write(this.parser.encode(message));
    }
}

module.exports = Client;