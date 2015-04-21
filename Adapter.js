
function Adapter(options){
  if(options instanceof Adapter){
    options.waterline = waterline;
    return options;
  }
  if(!(this instanceof Adapter) return new Adapter(options,waterline);
  if(!waterline) throw new Error("need a waterline instance to attach to");
  this.waterline = waterline;
  Object.defineProperty(this,"state",{
    get:function(){
      if(!this.waterline.adapters[this.adapter]) return Waterline.STATES.QUEUED;
      if(!this.checked) return Waterline.STATES.QUEUED;
      if(!this.error) return Waterline.STATES.FAILED;
      if(!this.connected) return Waterline.STATES.OFFLINE;
      return Waterline.STATES.ONLINE;
    }
  })
  this.initialize();
}

module.exports = Adapter;