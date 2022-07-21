const { fork } = require('child_process');
const { createInterface } = require('readline');
const { createLogger, PING } = require('./common');

const log = createLogger(`main(${process.pid})`);

let stopping = false;

// Fork will answer each ping message with a pong on its pipe(fd=4):
const child = fork('./fork.js', [], { stdio: ['inherit', 'inherit', 'inherit', 'ipc', 'pipe'] });

// ping-pong channel:
const pipe = child.stdio[4];

// ping-pong handler:
const lines = createInterface(pipe);
lines.on('line', line => ping());

let timeout, pingCounter = 0, bugCounter = 0;
function ping() {
    // readline may call `ping` a few times even after closure...
    if (stopping) {
        return;
    }
    pingCounter += 1;
    clearTimeout(timeout);
    pipe.write(PING);
    timeout = setTimeout(() => {
        bugCounter += 1;
        log('no response in 1s... sending ping again in 5s...');
        log(`sent ${pingCounter} ping(s) before the bug (${bugCounter})`);
        pingCounter = 0;
        timeout = setTimeout(() => {
            ping();
            log('ping!');
        }, 5_000);
    }, 1000);
}

// Start the ping-pong game:
ping();

// Stop the ping-pong game after 1 min:
setTimeout(stop, 60_000);

process.on('beforeExit', code => {
    log('exiting with code:', code);
});

function stop() {
    stopping = true;
    clearTimeout(timeout);
    log('ping-pong game is over!');
    if (bugCounter === 0) {
        log('it seems the bug did not happen');
    }
    child.on('close', (code, signal) => log('fork exited with:', code ?? signal));
    child.send('stop');
}
