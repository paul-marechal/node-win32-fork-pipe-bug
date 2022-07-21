exports.PING = 'ping'.repeat(100) + '\n';
exports.PONG = 'pong'.repeat(100) + '\n';

exports.createLogger = function (name) {
    const start = Date.now();
    return function log(...parts) {
        console.log(name, `: ${Date.now() - start}ms :`, ...parts);
    }
}
