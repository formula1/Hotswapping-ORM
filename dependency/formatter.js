module.exports = function(type){
  return function(obj){
    return type+'['+(obj.name||obj)+']';
  };
};