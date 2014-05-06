var Passenger = require('./van/passenger');
var colors = require('colors');
var _ = require('lodash');

var Van = function(options) {
  this.options = _.assign({
    stdout: process.stdout,
    stderr: process.stderr,
    colors: ['cyan', 'magenta', 'yellow', 'green', 'blue', 'red', 'grey', 'white']
  }, options);
  this.passengers = [];
  
  if (_.isPlainObject(this.options.scripts)) {
    _.forIn(this.options.scripts, function(script, prefix) {
      this.addPassenger(script, {prefix: prefix, stdout: this.options.stdout, stderr: this.options.stderr});
    }, this);
  } else if (_.isArray(this.options.scripts)) {
    _.each(this.options.scripts, function(script) {
      this.addPassenger(script, {stdout: this.options.stdout, stderr: this.options.stderr});
    }, this);
  }
}

Van.prototype.addPassenger = function(script, options) {
  options = options || {};
  options.color = options.color || this.options.colors[this.passengers.length % this.options.colors.length];
  
  var self = this;
  var passenger = new Passenger(script, options);
  this.passengers.push(passenger);
  passenger.on('exit', function() {
    self.passengers.splice(self.passengers.indexOf(passenger), 1);
    if (self.passengers.length == 0){ self.finish(); }
  });
  return passenger;
}

Van.prototype.print = function(data) {
  if (data.toString().trim().length > 0) console.log(data.toString());  
}

Van.prototype.finish = function(proc, code) {
  console.log("\nAll processes have exited, all done!".underline.bold);
  process.exit(0);
}

Van.prototype.start = function() {
  var self = this;
  this.passengers.forEach(function(passenger) {
    passenger.start();
  });
}

Van.prototype.stop = function() {
  this.passengers.forEach(function(passenger) {
    passenger.stop();
  });
}

// Run the passengers in sequence, aborting if there is
// a non-zero exit code.
Van.prototype.run = function() {
  if (this.passengers.length > 0) {
    this._runFirstPassenger();
  } else {
    this.options.stderr.write("\nError: ".red + "No scripts were loaded to be able to run.\n");
    process.exit(1);
  }
}

Van.prototype._runFirstPassenger = function() {
  var self = this;
  var passenger = this.passengers[0];
  
  passenger.once('exit', function(code) {
    if (parseInt(code) == 0) {
      if (self.passengers.length > 0) {
        self._runFirstPassenger();
      } else {
        process.exit(0);
      }
    } else {
      process.exit(code);
    }
  });
  
  this.options.stdout.write(("\n=== Running " + passenger.script.bold.underline + "\n"));
  passenger.start();
}

module.exports = Van;