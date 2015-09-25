
var formatters = require("../formatters.js");
var constructors = require("./constructor.js");
var STATES = require('../manager-states.json');

module.exports = function(self){
  var curstate = -2;
  Object.defineProperty(self,"state",{
    get:function(){
      var state = constructors.getConnectionState(this);
      console.log('notOnline');
      if(state !== STATES.ONLINE){
        return state;
      }
      console.log('isOnline');
      return constructors.getCollectionState(this,[]);
    },set:function(y){
      var os = curstate;
      curstate += y;
      if(curstate === 0){
        self.manager.ready(self);
      }else if(os === 0){
        self.manager.notReady(self);
      }
    }
  });
  constructors.handleConnectionDependencies(self);
  constructors.handleCollectionDependencies(self, self.schema);
  console.log(self.state);
  curstate /= 2;
};
