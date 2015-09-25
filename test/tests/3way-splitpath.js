//Example Test

var Manager = require("../../Manager");
var Connection = require("../../Connection");
var Collection = require("../../Collection");

var manager = new Manager();
var adapter = require('../test-adapter');
var connection = manager.loadConnection({name:"fakeConnection"},adapter);

module.exports = function(next){

  var schema1 = {
    prop:{type:'objectid', model:"Model2"}
  };

  var schema2 = {
    prop:{type:'objectid', model:"Model3"},
    prop2:{type:'objectid', model:"Model4"}
  };

  var schema3 = {
    prop:{type:'objectid', model:"Model1"}
  };

  var schema4 = {
    prop:{type:'objectid', model:"Model1"}
  };


  var errList = function(obj){
    throw new Error('this should not happen for '+obj.name);
  };

  var model1 = manager.loadCollection("Model1",schema1,"fakeConnection");
  var model2 = manager.loadCollection("Model2",schema2,"fakeConnection");

  manager.on("new-collection[Model1]",errList);

  manager.on("new-collection[Model2]",errList);

  manager.on("new-collection[Model3]",errList);

  var model3 = manager.loadCollection("Model3",schema3,"fakeConnection");

  manager.removeListener("new-collection[Model1]",errList);
  manager.removeListener("new-collection[Model2]",errList);
  manager.removeListener("new-collection[Model3]",errList);
  var done = 0;
  manager.on("new-collection[Model1]",function(){
    console.log('model1 loaded');
    done++;
  });
  manager.on("new-collection[Model2]",function(){
    console.log('model2 loaded');
    done++;
  });
  manager.on("new-collection[Model3]",function(){
    console.log('model3 loaded');
    done++;
  });
  manager.on("new-collection[Model4]",function(){
    console.log('model4 loaded');
    done++;
  });

  var model4 = manager.loadCollection("Model4",schema3,"fakeConnection");

  setImmediate(function(){
    if(done < 4) throw new Error('Not all 4 were done');
    if(done > 4) throw new Error('Something triggered twice');
    next();
  });
};
