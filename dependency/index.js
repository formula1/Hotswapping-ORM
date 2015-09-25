
var formatter = require('./formatter');
var STATES = require('./states.json');


function Dependent(type,name,manager){
  this.manager = manager;
  this.type = type;
  this.formatter = formatter(type);
  this.stateCheckers = [];
  this.name = name;
  this.oldState = STATES.QUEUED;
  this.checkState();
}


Dependent.prototype.all = require('./all');

Dependent.prototype.any = require('./any');

Dependent.prototype.async = require('./async');

Dependent.prototype.getState = function(others){
  if(!others){
    others = {};
    others[this.name] = {state:STATES.NOW_AVAILABLE};
  }
  var checkers = this.stateCheckers;
  var l = checkers.length;
  var ret = STATES.READY;
  while(l--) {
    var state = checkers[l](others);
    switch(state){
      case STATES.QUEUED: return STATES.QUEUED;
      case STATES.UNKNOWN: //If it comes back unkown it means the deps were resolved
      case STATES.NOW_AVAILABLE:
        ret = STATES.NOW_AVAILABLE;
    }
  }
  return ret;

};

Dependent.prototype.checkState = function(){
  if(this.isChecking){
    return;
  }
  this.isChecking = true;
  process.nextTick(checkState.bind(this));
};

function checkState (){
  this.isChecking = false;
  var newState = this.getState();
  if(newState === this.oldState) return;
  var manager = this.manager;
  if(newState === STATES.READY || this.oldState === STATES.QUEUED){
    this.oldState = STATES.READY;
    process.nextTick(manager.emit.bind(manager,'new-'+this.formatter(this),this));
  }else if(newState === STATES.QUEUED){
    this.oldState = STATES.QUEUED;
    process.nextTick(manager.emit.bind(manager,'rem-'+this.formatter(this),this));
  }
}

module.exports = Dependent;
