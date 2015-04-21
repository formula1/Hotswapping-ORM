
module.exports.handleConnectionDependencies = function(self){
  if(!self.connection) self.connection = ["default"];
  if(!Array.isArray(self.connection)) self.connection = [self.connection];

  function queue(connection){
    self.waterline.once("add-connection["+connection+"]",function(connection){
      if(self.state === Waterline.STATES.ONLINE && self.emittedAdd === false){
        self.emittedRemoval = true;
        self.emittedRemoval = false;
        self.waterline.emit("add-collection["+self.name+"]",self);
      }
      activate(connection);
    })
  }

  function activate(connection){
    self.waterline.once("sub-connection["+connection+"]",function(connection){
      if(self.emittedRemoval === false){
        self.emittedRemoval = true;
        self.emittedOnline = false;
        self.waterline.emit("sub-collection["+self.name+"]",self);
      }
      queue(connection);
    });
  }

  self.connection = self.connection.map(function(connection){
    if(connection instanceof Connection){
      connection = self.waterline.loadConnection(connection).name;
    }else if(typeof connection !== "string" ) throw new Error("Connections should be referenced by key");
    if(!self.waterline.connections[connection]) queue(connection);
    else activate(connection);
    return connection;
  });

};

module.exports.handleCollectionDependencies = function(self,schema){
  var depends = [];
  var collection;
  for(var i in schema.paths){
    if(schema.paths[i].type !== "OBJECTID") continue;
    if(schema.paths[i].model){
      collection = schema.paths[i].model
      if(collection instanceof Collection){
        collection = self.waterline.loadConnection(Collection).name;
      }else if(typeof collection !== "string" ) throw new Error("Connections should be referenced by key");
      if(!self.waterline.collections[collection]) queue(collection);
      else activate(collection);
      depends.push(collection);
    }
  }
  this.collections = depends;
  
  function queue(collection){
    self.waterline.once("add-collection["+collection+"]",function(collection){
      if(self.state === Waterline.STATES.ONLINE && self.emittedOnline === false){
        self.emittedRemoval = false;
        self.emittedOnline = true;
        self.waterline.emit("add-collection["+self.name+"]",self);
      }
      activate(collection);
    })
  }

  function activate(connection){
    self.waterline.once("sub-collection["+collection+"]",function(collection){
      if(self.emittedRemoval === false){
        self.emittedRemoval = true;
        self.emittedOnline = false;
        self.waterline.emit("sub-collection["+self.name+"]",self);
      }
      queue(collection);
    });
  }
  
  switch(this.state){
    case Waterline.STATES.ONLINE: return activate();
    case Waterline.STATES.REJECTED: throw Error("Adapter has been Rejected");
    case Waterline.STATES.QUEUED: return queue();
    case Waterline.STATES.OFFLINE: return queue();
  }
};

module.exports.inheritMethods = function(self,schema){
  for(var i in schema.statics){
    if(/before|after|validate|create|update|find|destroy/.test(i)){
      throw new Error("Attempting to define restricted static method: "+i);
    }
    self[i] = schema.statics[i];
  }
  for(var i in schema.methods){
    if(/save|populate|destroy/.test(i)){
      throw new Error("Attempting to define restricted instance method: "+i);
    }
    self.prototype[i] = schema.methods[i];
  }
};

module.exports.getCollectionState = getCollectionState;
module.exports.getConnectionState = getConnectionState;


function getCollectionState(self,previousCollections){
  previousCollections = previousCollections||[];
  var allRejected=true,i,l,state;
  for(i=0,l=self.collections.length;i<l;i++){
    var depCol = self.collection[i];
    if(!self.waterline.collections[depCol]) return Waterline.STATES.QUEUED;
    if(previousCollections.indexOf(depCol) != -1) continue;
    state = getCollectionState(this.waterline.collections[depCol],previousCollections.concat([this.name]));
    if(state !== Waterline.STATES.ONLINE){
      return state;
    }
  }
  return Waterline.STATES.ONLINE;
}

function getConnectionState(self){
  for(i=0,l=self.connections.length;i<l;i++){
    var conn = self.connections[i];
    if(!self.waterline.connections[conn]) continue;
    if(self.waterline.connections[conn].state == Waterline.STATES.ONLINE){
      return Waterline.STATES.ONLINE;
    }
    if(self.waterline.connections[conn].state == Waterline.STATES.OFFLINE){
      return Waterline.STATES.OFFLINE;
    }
  }
  return Waterline.STATES.QUEUED;
}