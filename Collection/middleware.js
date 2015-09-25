
var async = require('async');

module.exports = MiddlewareResolver;

function MiddlewareResolver(types){
  var middleware = this._middleware = {};
  types.forEach(function(type){
    middleware[type] = {pre:[],post:[]};
  });
}

MiddlewareResolver.prototype.resolve = function(type,obj,fn,next){
  async.applyEachSeries(this.getMiddleware(type,'pre'),obj,function(err){
      if(err) return next(err);
      fn(obj,function(ret){
        this.getMiddleware(type,'post').forEach(function(fn){
          fn(ret);
        });
        next(ret);
      });
    });
};

MiddlewareResolver.prototype.getMiddleware = function(type,time){
  if(!(type in this._middleware)) throw new Error(type+" not in the middleware");
  if(!time) return this._middleware[type];
  if(!(time in this._middleware[type])) throw new Error(time+" not in the middleware["+type+"]");
  return this._middleware[type];
};

var MIDDLEWARE_TIMINGS = [
  "pre",
  "post"
];

MIDDLEWARE_TIMINGS.forEach(function(time){
  MiddlewareResolver.prototype[time] = function(type,fn){
    if(!(type in this._middleware)){
      throw new Error(
        "cannot add middleware not in types: "+
        JSON.stringify(Object.keys(this.middleware))
      );
    }
    if(typeof fn != "function"){
      throw new Error(
        "callback supplied for("+
        time+" "+type+
        " is not a function"
      );
    }
    this._middleware[type][time].push(fn);
  };
});
