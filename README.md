# node-win32-fork-pipe-bug

Reproduction repository for a bug with Node on Windows where extra child process pipes aren't working.

`main.js` will spawn `fork.js` using `child_process.fork` with an extra pipe opened.

When the fork reads a "ping" message on the pipe it will write a "pong" back.

When main reads a "pong" message on the pipe it will write a "ping" back.

Both processes will exchanges ping/pong messages as fast as possible this way.

> Note that a message is simply delimited by a line return in the stream.

The main script has logic to detect when a response takes too long to come from the fork:

If a "pong" message takes more than 1s to arrive it will log it then wait for 5s before sending another "ping".

From my testing, it seems like writes from the fork can get "stuck" and main needs to write something to unblock it.
