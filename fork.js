const { Socket } = require('net');
const { createInterface } = require('readline');
const { createLogger, PONG } = require('./common');

const log = createLogger(`fork(${process.pid})`);

// ping-pong channel:
const pipe = new Socket({ fd: 4 });

// ping-pong handler:
const lines = createInterface(pipe);
lines.on('line', line => pong());

process.on('message', message => {
    if (message === 'stop') {
        log('received "stop" via IPC');
        stop();
    }
})

process.on('beforeExit', code => {
    log('exiting with code:', code);
});

function pong() {
    pipe.write(PONG);
}

function stop() {
    process.disconnect();
    pipe.destroy();
}
