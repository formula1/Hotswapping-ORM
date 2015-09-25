module.exports.formatCollection = function(item){
  return "collection["+(item.name||item)+"]";
};

module.exports.formatConnection = function(item){
  return "connection["+(item.name||item)+"]";
};

module.exports.formatAdapter = function(item){
  return "adapter["+(item.name||item)+"]";
};
