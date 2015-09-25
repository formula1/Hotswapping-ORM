var Manager = require('./Manager');
var formatters = require('./formatters.js');

function Adapter(options){
  Adapter.validateConnectionOptions(options.connection);
  this.connectionOps = options.connection;
  Adapter.validateCollectionOptions(options.collection);
  this.collectionOps = options.collection;
  Adapter.validateInstanceOptions(options.instance);
  this.instanceOps = options.instance;

}

Adapter.validateConnectionOptions = function(options){
  if(!options) throw new Error('need a way to do Setup Connections');
  if(!('create' in options)) throw new Error('need a way to create connections');
  if(!('destroy' in options)) throw new Error('need a way to destroy connections');
  return true;
};

Adapter.validateCollectionOptions = function(options){
  if(!options) throw new Error('need a way to do Setup tables');
  if(!('create' in options)) throw new Error('need a way to create tables');
  if(!('request' in options)) throw new Error('need a way to request tables');
  if(!('validate' in options)) throw new Error('need a way to validate tables');
  if(!('update' in options)) throw new Error('need a way to recreate tables');
  if(!('destroy' in options)) throw new Error('need a way to do destroys');
  return true;
};

Adapter.validateInstanceOptions = function(options){
  if(!options) throw new Error('need a way to do CRUD');
  if(!('create' in options)) throw new Error('need a way to do creates');
  if(!('request' in options)) throw new Error('need a way to do requests');
  if(!('update' in options)) throw new Error('need a way to do updates');
  if(!('destroy' in options)) throw new Error('need a way to do destroys');
  return true;
};


module.exports = Adapter;
