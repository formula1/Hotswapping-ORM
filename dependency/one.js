
module.exports = function(ee,self,formatSelf,dep,formatDep,all){
  var queue,activate;

  activate = function(dep){
    self.state = 1;
    ee.once("sub-"+formatDep(dep),queue);
  };

  queue = function(dep){
    self.state = -1;
    ee.once("add-"+formatDep(dep),activate);
  };

  ee.once("rem-"+formatSelf(self),function(self){
    ee.removeListener("rem-"+formatDep(dep),queue);
    ee.removeListener("new-"+formatDep(dep),activate);
  });

  if(!(dep in all)){
    return queue(item);
  }
  if(all[dep].state !== STATES.ONLINE){
    return queue(dep);
  }
  return activate(dep);
};
