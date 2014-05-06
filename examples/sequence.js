var Van = require('../lib');

var van = new Van({
  scripts: [
    'echo "Hello"',
    'ls derp'
  ]
});

van.run();

process.on('SIGINT', function() {
  van.stop();
});