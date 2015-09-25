var cluster = require('cluster');
var ee = require('events').EventEmitter;
var formatters = require('./formatters');

var Connection = require('./Connection');
var Adapter = require('./Adapter');
var Collection = require('./Collection');

function Manager(){
  ee.call(this);
  var self = this;
  this.master = false;
  if(!cluster.isMaster){
    process.send("database-manager-child");
    process.once("message",function(msg){
      if(msg === "database-manager-master"){
        self.master = true;
        process.on("message",function(msg){
          if(msg.type !== "database-manager-master-event") return;
          self.emit(msg.event,msg.data);
        });
      }
    });
  }

  this.connections = {};
  this.collections = {};
}

Manager.prototype = Object.create(ee.prototype);
Manager.prototype.constructor = Manager;

Manager.prototype.loadConnection = function(connection,adapter,next){
  if(connection.name in this.connections){
    throw new Error(connection.name+' is already loaded');
  }
  if(!(adapter instanceof Adapter)){
    throw new Error('Connections need an adapter to be initialized');
  }
  return this.connections[connection.name] = Connection(connection,adapter,this);
};

Manager.prototype.loadCollection = function(name,collection,connections){
  return this.collections[name] = Collection(name,collection,connections,this);
};


Manager.prototype.removeAdapter = function(obj){
  var name, oc;
  if(obj instanceof Adapter){
    name = obj.name;
    oc = obj;
  }else if(typeof obj === 'string'){
    name = obj;
    oc = this.adapter[name];
  }else{
    throw new Error('can only remove an adapter by reference or by name');
  }
  oc.destroy();
  delete this.adapter[name];
  return oc;
};

Manager.prototype.removeConnection = function(obj){
  var name, oc;
  if(obj instanceof Connection){
    name = obj.name;
    oc = obj;
  }else if(typeof obj === 'string'){
    name = obj;
    oc = this.connection[name];
  }else{
    throw new Error('can only remove an connection by reference or by name');
  }
  oc.destroy();
  delete this.connection[name];
  return oc;
};

Manager.prototype.removeCollection = function(collection){
  var name, oc;
  if(obj instanceof Collection){
    name = obj.name;
    oc = obj;
  }else if(typeof obj === 'string'){
    name = obj;
    oc = this.collection[name];
  }else{
    throw new Error('can only remove an collection by reference or by name');
  }
  oc.destroy();
  delete this.collection[name];
  return oc;
};

Manager.STATES = require("./manager-states.json");

module.exports = Manager;
