var schema_utils = require("./Schema/util");
var Connection = require('../Connection');


module.exports.mapConnections = function(connections){
  if(!connections) return ['default'];
  if(!Array.isArray(connections)) connections = [connections];
  return connections.map(function(connection){
    if(connection instanceof Connection){
      connection = connection.name;
    }
    if(typeof connection !== "string" ){
      throw new Error("Connections should be referenced by key");
    }
    return connection;
  });
};

module.exports.mapCollections = function(self,schema){
  var Collection = self.constructor;
  var collections = schema_utils.getModelDeps(schema);
  return collections.map(function(collection){
    if(collection instanceof Collection){
      collection = self.manager.loadCollection(Collection).name;
    }
    if(typeof collection !== "string" ){
      throw new Error("Connections should be referenced by key");
    }
    return collection;
  });
};
