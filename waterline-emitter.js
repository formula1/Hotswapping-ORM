var cluster = require('cluster');
var async = require("async")
var ee = require('events').EventEmitter;

function WaterLine(){
  ee.call(this);
  var self = this;
  this.master;
  if(!cluster.isMaster){
    process.send("waterline-child");
    process.once("message",function(msg){
      if(msg === "waterline-master"){
        self.master = true;
        process.on("message",function(msg){
          if(msg.type !== "waterline-master-event") return;
          self.emit(msg.event,msg.data);
        })
      }
    });
  }

  this.adapters = {};
  this.connections = {};
  this.collections = {};
}

Waterline.prototype = Object.create(ee.prototype);
Waterline.prototype.constructor = Waterline;

Waterline.prototype.loadAdapter = function(adapter,next){
  this.adapters[adapter.name] = Adapter(adapter,this);
  return this.adapters[adapter.name];
}

Waterline.prototype.loadConnection = function(connnection){
  if(connection.adapter instanceof Adapter && !(connection.adapter.name in this.adapters)){
    connection.adapter = this.loadAdapter(connection.adapter).name;
  }
  this.connections[connection.name] = Connection(connection,this);
  return this.connections[connection.name];
}

Waterline.prototype.loadCollection = function(collection,connections){
  this.collection[collection.name] = Collection(collection,connections,this);
  return this.collection[collection.name];
}


Waterline.prototype.removeAdapter = function(adapter){
  var oc = this.adapter[adapter]
  oc.destroy()
  delete this.adapter[adapter
  return oc;
}

Waterline.prototype.removeConnection = function(connnection){
  var oc = this.connection[connection]
  oc.destroy()
  delete this.connection[connection];
  return oc;
}

Waterline.prototype.removeCollection = function(collection){
  var oc = this.collection[collection]
  oc.destroy()
  delete this.collection[collection];
  return oc;
}

Waterline.STATES = [
  QUEUED: "queued",
  ONLINE:"online",
  OFFLINE:"offline",
  REJECTED:"fail"
]

module.exports = Waterline;

