'use strict';
const Client = require('../lib/Client');

let rid = 0;
const service = {};
const queue = [];
const requestQueue = new Map();

function start(ready) {
    const client = new Client({host:'127.0.0.1',port: 8888});

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

        const ret = client.send(req);
        requestQueue.set(rid,Object.assign({
            callback: callback,
            timer: setTimeout(()=> {
                callback(new Error('timeout'));
                requestQueue.delete(rid);
            }, 3000)
        }, req));

        if (!ret) {
            console.log(ret);
        }
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

    const count = 8000;
    let success = 0;
    let error = 0;
    const start = Date.now();
    const args = [];
    for(let i=0;i<1000;i++) {
        args.push(i);
    }
    for(let i =0 ;i<count;i++) {
        service.add.apply(service, args.concat(function(err, result) {
            if (err) {
                error++;
            } else {
                success++;
            }

            if(count === error + success) {
                console.log(result);
                console.log(`success :${success}\n error :${error}`);
                process.exit(0);
            }
        }));
    }
    console.log(Date.now()-start);
});