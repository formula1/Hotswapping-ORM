var STATES = require("./states.json");
var formatter = require('./formatter');

module.exports = function(type,deps,all){
  var ee = this.manager;
  var self = this;
  var formatSelf = this.formatter;
  var formatDep = formatter(type);

  var count = -1*deps.length;
  var queue,activate;


  /*
    What we can do is resolve this dependency
    Then add dependency based on state later

  */

  this.stateCheckers.push(getAll.bind(this,all,deps));

  activate = function(dep){
    count++;
    if(count === 0){
      self.checkState();
    }
    ee.once("rem-"+formatDep(dep),queue);
  };

  queue = function(dep){
    if(count === 0){
      self.checkState();
    }
    count--;
    ee.once("new-"+formatDep(dep),activate);
  };

  ee.once("rem-"+formatSelf(self),function(self){
    deps.forEach(function(dep){
      ee.removeListener("rem-"+formatDep(dep),queue);
      ee.removeListener("new-"+formatDep(dep),activate);
    });
  });

  var others = {};
  others[this.name] = {state:STATES.NOW_AVAILABLE};
  var nvs = [];
  deps.forEach(function(item){
    if(!(item in all)) return queue(item);
    switch(all[item].getState(others)){
      case STATES.QUEUED: return queue(item);
      case STATES.UNKNOWN: //If it comes back unkown it means the deps were resolved
      case STATES.NOW_AVAILABLE:
        nvs.push(item);
        break;
      case STATES.READY:
        activate(item);
        break;
    }
  });
  var nv; while(nv = nvs.pop()){
    if(count+1+nvs.length < 0){queue(nv);}
    else{activate(nv);}
  }
  count /= 2;
  this.checkState();
};

function getAll(all,deps,others){
  if(deps.length === 0) return STATES.READY;
  var watchers = [];
  if(!(this.name in others)) others[this.name] = {state:STATES.UNKNOWN,watchers:watchers};
  var l = deps.length;
  var watching = [];
  var finishedLoop = false;
  var ret = STATES.READY;
  var self = this;
  var runWatchers = function(state){
    others[self.name].state = state;
    var w; while(w = watchers.pop()) w(state);
    return state;
  };
  var checkReady=function(instance,state){
    watching.splice(watching.indexOf(instance),1);
    if(state === STATES.QUEUED) return runWatchers(state);
    if(state === STATES.NOW_AVAILABLE) ret = STATES.NOW_AVAILABLE;
    if(watching.length > 0) return;
    if(!finishedLoop) return;
    runWatchers(ret);
  };

  while(l--){
    var dep = deps[l];
    var state;
    if(dep in others){
      state = others[dep].state;
    }else if(dep in all){
      state = all[dep].getState(others);
    }else return runWatchers(STATES.QUEUED);
    switch(state){
      case STATES.QUEUED: return runWatchers(STATES.QUEUED);
      case STATES.UNKNOWN:
        watching.push(others[dep]);
        others[dep].watchers.push(checkReady.bind(void 0,others[dep]));
        break;
      case STATES.NOW_AVAILABLE:
        ret = STATES.NOW_AVAILABLE;
    }
  }
  finishedLoop = true;
  return watching.length?STATES.UNKNOWN:runWatchers(ret);
}
