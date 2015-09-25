var STATES = require("./states.json");
var formatter = require('./formatter');

module.exports = function(type,deps,all){
  var ee = this.manager;
  var self = this;
  var fSelf = this.formatter;
  var fDep = formatter(type);

  var count = deps.length;
  var queue,activate;


  this.stateCheckers.push(getAny.bind(this,all,deps));

  activate = function(dep){
    ee.once("rem-"+fDep(dep),queue);
    if(count === 0){
      self.checkState();
    }
    count++;
  };

  queue = function(dep){
    count--;
    if(count === 0){
      self.checkState();
    }
    ee.once("new-"+fDep(dep),activate);
  };

  ee.once("rem-"+fSelf(self),function(self){
    deps.forEach(function(dep){
      ee.removeListener("rem-"+fDep(dep),queue);
      ee.removeListener("new-"+fDep(dep),activate);
    });
  });

  var others = {};
  others[this.name] = {states:STATES.NOW_AVAILABLE};
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
  var nv; while(nv = nvs.pop())
    if(count+1+nvs.length < deps.length*2) queue(nv);
    else activate(nv);
  count /= 2;
  this.checkState();
};

function getAny(all,deps,others){
  if(deps.length === 0) return STATES.READY;
  var watchers = [];
  if(!(this.name in others)) others[this.name] = {state:STATES.UNKNOWN,watchers:watchers};
  var l = deps.length;
  var watching = [];
  var finishedLoop = false;
  var self = this;
  var runWatchers = function(state){
    others[self.name].state = state;
    var w; while(w = watchers.pop()) w(state);
    return state;
  };
  var checkReady=function(instance,state){
    watching.splice(watching.indexOf(instance),1);
    if(state !== STATE.QUEUED) return runWatchers(state);
    if(watching.length > 0) return;
    if(!finishedLoop) return;
    runWatchers(state);
  };

  while(l--){
    var dep = deps[l];
    var state;
    if(dep in others){
      state = others[dep].state;
    }else if(dep in all){
      state = all[dep].getState(others);
    }else{
      continue;
    }
    switch(state){
      case STATES.QUEUED: continue;
      case STATES.UNKNOWN:
        watching.push(others[dep]);
        others[dep].watchers.push(checkReady.bind(void 0,others[dep]));
        break;
      default:
        return runWatchers(state);
    }
  }
  finishedLoop = true;
  return watching.length?STATES.UNKNOWN:runWatchers(STATES.QUEUED);
}
