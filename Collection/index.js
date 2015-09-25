
var state = require("./state");
var MiddlewareResolver = require('./middleware');
var DependencyResolver = require('../dependency');
var constructors = require("./constructor.js");
module.exports = Collection;


function Collection(name,options,connections,manager){
  if(name instanceof Collection){
    name.manager = manager;
    return options;
  }
  if(!(this instanceof Collection)) return new Collection(name,options,connections,manager);
  if(!manager) throw new Error("need a manager instance to attach to");

  var self = this;
  this.schema = options;
  MiddlewareResolver.call(this,["validate","create","update","destroy"]);
  DependencyResolver.call(this,'collection',name,manager);

  this.connections = constructors.mapConnections(connections);
  this.any('connection', this.connections, manager.connections);

  this.collections = constructors.mapCollections(this, self.schema);
  this.all('collection', this.collections, manager.collections);
}

Collection.prototype = Object.create(MiddlewareResolver.prototype);

for(var i in DependencyResolver.prototype){
  Collection.prototype[i] = DependencyResolver.prototype[i];
}

Collection.prototype.constructor = Collection;
