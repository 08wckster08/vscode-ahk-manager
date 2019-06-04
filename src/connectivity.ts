import * as net from "net";

/**
 * https://github.com/feross/connectivity
 * Detect if the network is up (do we have connectivity?)
 * @return {boolean}
 */
export function checkConnection(cb: (online: boolean) => void) {
    var called = false;
    var socket = net.connect({
        port: 80,
        host: 'www.google.com'
    });

    // If no 'error' or 'connect' event after 5s, assume network is down
    var timer = setTimeout(function () {
        done(true);
    }, 5000);

    var done = (err: boolean) => {
        if (called)
            return;
        clearTimeout(timer);
        socket.unref();
        socket.end();
        cb(!err);
    };

    socket.on('error', done);
    socket.on('connect', done);
}