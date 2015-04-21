
var constructors = require("./constructor.js");

function Collection(options,connections,waterline){
  if(options instanceof Collection){
    options.waterline = waterline;
    return options;
  }
  if(!(this instanceof Collection) return new Collection(options,waterline);
  if(!waterline) throw new Error("need a waterline instance to attach to");

  this.waterline = waterline;
  var self = this;
  this.name = options.name;
  delete options.name;
  constructors.handleConnectionDependencies(self);
  constructors.handleCollectionDependencies(self)
  constructors.inheritMethods(self,options);
  
  Object.defineProperty(this,"state",{
    get:function(){
      var state = constructors.getCollectionState(self,[]);
      if(state !== Waterline.STATES.ONLINE){
        return state;
      }
      return constructors.getConnectionState(self);
    }
  })
  
  this._middleware = {
    beforeValidate:[],
    afterValidate:[],
    beforeCreate:[],
    afterCreate:[],
    beforeUpdate:[],
    afterUpdate:[],
    beforeDestroy:[],
    afterDestroy:[],
  };
}

Collection.prototype.prototype = require("Instance");

Collection.prototype.getMiddleware = function(type){
  if(!(type in collection._middleware)) throw new Error(type+" not in the middleware");
  return this._middleware[type];
};

var MIDDLEWARE_TYPES = [
  "validate",
  "create",
  "update",
  "destroy"
];
var MIDDLEWARE_TIMINGS = [
  "before",
  "after"
];

MIDDLEWARE_TIMINGS.forEach(function(time){
  Collection.prototype[time] = function(type,fn){
    if(MIDDLEWARE_TYPES.indexOf(type) === -1){
      throw new Error(
        "cannot add middleware not in types: "+
        JSON.stringify(MIDDLEWARE_TYPES)
      );
    }
    if(typeof fn != "function"){
      throw new Error(
        "callback supplied for("+
        time+" "+type+
        " is not a function"
      );
    }
    this._middleware[time+capitalizeFirstLetter(type)].push(fn);
  };
});
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}


module.exports = Collection;