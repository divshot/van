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
  var out = data.toString().trim();
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
  this.proc = spawn(parts[0], parts.slice(1));
  this.running = true;
  
  this.proc.stdout.on('data', function(data) {
    self.print.call(self, data, self.options.stdout);
  });
  this.proc.stderr.on('data', function(data) {
    self.print.call(self, data, self.options.stderr);
  });
  
  this.proc.on('exit', function(code) {
    self.running = false;
    self.print.call(self, ("Process exited with status " + code.toString().bold).underline + "\n", self.options.stdout);
    self.emit('exit', code);
  });
}

Passenger.prototype.stop = function(signal) {
  if (!this.running) { return false }
  this.proc.kill(signal);
}

module.exports = Passenger;