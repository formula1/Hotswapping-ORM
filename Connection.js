

function Connection(options,waterline){
  if(options instanceof Connection){
    options.waterline = waterline;
    return options;
  }
  if(!(this instanceof Connection) return new Connection(options,waterline);
  if(!waterline) throw new Error("need a waterline instance to attach to");
  this.waterline = waterline;
  Object.defineProperty(this,"state",{
    get:function(){
      if(this.error) return Waterline.STATES.FAILED;
      if(!this.waterline) return Waterline.States.UNINITIALIZED;
      if(!this.waterline.adapters[this.adapter]) return Waterline.STATES.QUEUED;
      return waterline.adapters[this.adapter].state;
    }
  })
  var self = this;
  function queue(){
    self.waterline.once("add-adapter["+this.adapter+"]",function(adapter){
      self.initialize(function(err){
        if(err){
          self.error = err;
          return self.waterline.emit("error",err,self);
        }
        activate();
      })
    })
  }
  function activate(){
    self.waterline.emit("add-connection["+self.name+"]",self);
    self.waterline.once("sub-adapter["+self.adapter+"]",function(adapter){
      self.waterline.emit("sub-connection["+self.name+"]",self);
      queue();
    });
  }
  
  switch(this.state){
    case Waterline.STATES.ONLINE: return activate();
    case Waterline.STATES.REJECTED: throw Error("Adapter has been Rejected");
    case Waterline.STATES.QUEUED: return queue();
    case Waterline.STATES.OFFLINE: return queue();
  }

}


module.exports = Connection;

