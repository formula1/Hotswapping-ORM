var DependencyResolver = require('../dependency');
var EE = require('events').EventEmitter;

function Connection(options,adapter,manager){
  if(options instanceof Connection){
    if(options.manager){
      throw new Error("This Connection already is bounded to a manager instance");
    }
    options.manager = manager;
    return options;
  }
  if(!(this instanceof Connection)) return new Connection(options,adapter,manager);
  if(!manager) throw new Error("need a manager instance to attach to");

  EE.call(this);

  this.adapter = adapter;
  this.options = options;

  DependencyResolver.call(this,'connection',options.name,manager);
  delete options.name;

  var self = this;

  this.async(function(stopped,ready){
    self.on('connected',ready);
    self.on('disconnected',stopped);
    stopped();
  });
  this.connect(function(){});
}

Connection.prototype = Object.create(EE.prototype);

for(var i in DependencyResolver.prototype){
  Connection.prototype[i] = DependencyResolver.prototype[i];
}

Connection.prototype.constructor = Connection;

Connection.prototype.connect = function(next){
  var self = this;
  this.adapter.connectionOps.create(this,function(err){
    if(err){
      self.error = err;
      return next(err);
    }
    self.state = 1;
    self.emit('connected');
    next();
  });
};

Connection.prototype.disconnect = function(next){
  var adapter = this.adapter;
  this.adapter.connectionOps.destroy(this,function(err){
    self.emit('disconnected');
    if(err){
      self.error = err;
      self.manager.emit('error',err);
    }
    next(err);
  });
};

module.exports = Connection;
