var spawn = require('child_process').spawn;
var colors = require('colors');
var util = require('util');
var events = require('events');
var _ = require('lodash');

var Passenger = function(script, options) {
  this.script = script;
  this.options = _.assign({
    stdout: process.stdout,
    stderr: process.stderr
  }, options);
}
util.inherits(Passenger, events.EventEmitter);

Passenger.prototype.preparePrint = function(data) {
  var out = data.toString();
  if (this.options.prefix) {
    var prefix = "[" + this.options.prefix + "] ";
    out = prefix[this.options.color || 'bold'] + data;
  } 
  return out;
}

Passenger.prototype.print = function(data, stream) {
  stream = stream || this.options.stdout;
  stream.write(this.preparePrint(data));
}

Passenger.prototype.start = function() {
  var self = this;
  var parts = this.script.split(' ');
  this.proc = spawn('/bin/sh', ['-c', this.script], _.pick(this.options, ['cwd', 'env']));
  this.running = true;
  
  this.proc.stdout.on('data', function(data) {
    self.print.call(self, data, self.options.stdout);
  });
  this.proc.stderr.on('data', function(data) {
    self.print.call(self, data, self.options.stderr);
  });
  
  this.proc.on('exit', function(code) {
    var success = (parseInt(code) === 0)
    var stream = success ? self.options.stdout : self.options.stderr;
    
    var msg = "Process " + self.script.bold + " exited"
    if (code) {
      msg += " with status " + outCode.bold + "\n";
    } else {
      msg += "\n";
    }
    
    if (!code) {
      msg = "\n--- Terminated: ".yellow + msg;
    } else if (success) {
      msg = "\n--- Success: ".green + msg;
    } else {
      msg = "\n--- Error: ".red + msg;
    }
    
    self.running = false;
    stream.write(msg);
    self.emit('exit', code);
  });
}

Passenger.prototype.stop = function(signal) {
  this.print("Received " + signal.bold + " for process " + this.script.bold + "\n", this.options.stdout);
  if (!this.running) { return false }
  this.proc.kill(signal);
}

module.exports = Passenger;