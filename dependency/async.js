var STATES = require("./states.json");


module.exports = function(runner){
  var curState = STATES.QUEUED;
  var self = this;
  var stopped = function(){
    curState = STATES.QUEUED;
    self.checkState();
  };
  var ready = function(){
    curState = STATES.READY;
    self.checkState();
  };
  this.stateCheckers.push(function(){
    return curState;
  });
  runner(stopped, ready);
};