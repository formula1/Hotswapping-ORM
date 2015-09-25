module.exports.getModelDeps = function(schema){
  var item;
  var deps = [];
  for(var i in schema){
    item = schema[i];
    if(item.type !== "objectid") continue;
    if(item.model === void 0) continue;
    if(deps.indexOf(item.model) !== -1) continue;
    deps.push(item.model);
  }
  return deps;
};
