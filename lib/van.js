var spawn = require('child_process').spawn;

var Van = function(options) {
  this.options = options;
  this.processes = [];
}

Van.prototype.print = function(data) {
  if (data.toString().trim().length > 0) console.log(data.toString());  
}

Van.prototype.exited = function(proc, code) {
  this.processes.splice(this.processes.indexOf(proc), 1);
  if (this.processes.length === 0) {
    console.log("All processes have exited, all done!");
    process.exit(0);
  }
}

Van.prototype.startProcess = function(script) {
  var self = this;
  var parts = script.split(' ');
  var proc = spawn(parts[0], parts.slice(1));
  proc.stdout.on('data', this.print.bind(this));
  proc.stderr.on('data', this.print.bind(this));
  proc.on('exit', function(code) {
    console.log("Process exited with code:",code);
    self.exited(proc, code);
  });
  
  this.processes.push(process);
}

Van.prototype.start = function() {
  var self = this;
  this.options.scripts.forEach(function(script) {
    console.log("Starting process " + script);
    self.startProcess(script)
  });
}

Van.prototype.stop = function() {
  this.processes.forEach(function(proc) {
    console.log("Killing process.");
    proc.kill();
  });
}

Van.interleave = function(options) {
  options.mode = 'interleave';
  var van = new Van(options);
  van.start();
  return van;
}

module.exports = Van;