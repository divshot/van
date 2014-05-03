var Passenger = require('./van/passenger');
var _ = require('lodash');

var Van = function(options) {
  this.options = _.assign({}, options);
  this.passengers = [];
  
  if (_.isPlainObject(options.scripts)) {
    _.forIn(options.scripts, function(script, prefix) {
      this.addPassenger(script, {prefix: prefix});
    }, this);
  } else if (_.isArray(options.scripts)) {
    _.each(options.scripts, function(script) {
      this.addPassenger(script);
    }, this);
  }
}

Van.prototype.addPassenger = function(script, options) {
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

module.exports = Van;