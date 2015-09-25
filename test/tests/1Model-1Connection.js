//Example Test

module.exports = function(next){
  var Manager = require("../../Manager");
  var Connection = require("../../Connection");
  var Collection = require("../../Collection");


  var manager = new Manager();
  var adapter = require('../test-adapter');
  var connection = manager.loadConnection({name:"fakeConnection"},adapter);

  manager.removeAllListeners("new-connection[fakeConnection]");

  manager.on("new-connection[fakeConnection]",function(){
    console.log('connection loaded');
  });


  var schema1 = {};

  var wasLoaded = false;
  manager.on("new-collection[Model1]",function(){
    console.log('model1 loaded');
    wasLoaded = true;
  });

  var model1 = manager.loadCollection("Model1",schema1,"fakeConnection");

  setImmediate(function(){
    if(!wasLoaded) throw new Error('Model was not loaded');
    next();
  });
};
