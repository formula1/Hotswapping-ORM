var formatters = require("../formatters");
var STATES = require('../manager-states.json');

module.exports = function(self){
  var curstate = -1;
  var manager = self.manager;
  Object.defineProperty(self,"state",{
    get:function(){
      if(!self.checked) return STATES.INITIALIZING;
      if(self.error) return STATES.FAILED;
      return STATES.ONLINE;
    },set:function(y){
      var os = curstate;
      curstate += y;
      if(curstate === 0){
        manager.ready(this);
      }else if(os === 0){
        manager.notReady(this);
      }
    }
  });

  self.create(function(err){
    if(err) manager.emit(err,err);
  });
};
