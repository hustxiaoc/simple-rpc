'use strict';
const Client = require('../lib/Client');

let rid = 0;
const service = {};
const queue = [];
const requestQueue = new Map();

function start(ready) {
    const client = new Client();

    function send() {
        rid++;
        let args = [].slice.call(arguments);
        const method = args.slice(0,1)[0];
        const callback = args.slice(-1)[0];

        const req = {
            rid: rid,
            method:method,
            args:args.slice(1,-1)
        };

        requestQueue.set(rid,Object.assign({
            callback: callback
        }, req));

        client.send(req);
    }

    client.on('message', function(message){
        if (message.action === 'register') {
            message.methods.forEach((method) => {
                service[method] = send.bind(null, method);
            });
            ready(service);
        } else {
            const req = requestQueue.get(message.rid);
            const callback = req.callback;
            if (message.success) {
                callback(null, message.data);
            } else {
                callback(new Error(message.error));
            }
            requestQueue.delete(message.rid);
        }
    });
}

start((service)=> {
    service.add(1,2,3,4,5, function(err, result) {
        console.log(`1+2+3+4+5 = ${result}`);
    });

    service.time(1,2,3,4,5, function(err, result) {
        console.log(`1*2*3*4*5 = ${result}`);
    });
});