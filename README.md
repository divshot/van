# Van: Simple Multi-Process Execution

Van is meant to provide simple multi-process execution for Node scripts.

**Warning:** This library was created and intended for spinning up multiple
processes on a local development environment. It isn't designed or intended
(at least at this point) for any kind of production-server like usage. In
other words, this is a dev utility not a [foreman](https://github.com/ddollar/foreman)
replacement.

## Interleave

The most common use case for Van is to run several processes at once and
interleave their output. Van also makes it easy to send termination signals
to all of the child processes at once as well as know when all child processes
have exited. An example:

```js
var Van = require("van")

var van = new Van({
  scripts: {
    jekyll: 'bundle exec jekyll build --watch', 
    server: 'superstatic -p 4000'
  }
});

// spawn the child processes and interleave output
van.start();

process.on('SIGINT', function() {
  // send a kill signal to each child process
  van.stop();
});
```