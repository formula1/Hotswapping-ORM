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
    prop:{type:'objectid', model:"Model3"}
  };

  var schema3 = {
    prop:{type:'objectid', model:"Model1"}
  };


  var errList1,errList2;

  manager.on("new-collection[Model1]",errList1 =function(){
    throw new Error("this should not be working yet");
  });

  var model1 = manager.loadCollection("Model1",schema1,"fakeConnection");

  setImmediate(function(){
    manager.on("new-collection[Model2]",errList2 = function(){
      throw new Error("this should not be working yet");
    });

    var model2 = manager.loadCollection("Model2",schema2,"fakeConnection");

    setImmediate(function(){
      manager.removeListener("new-collection[Model1]",errList1);
      manager.removeListener("new-collection[Model2]",errList2);

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

      var model3 = manager.loadCollection("Model3",schema3,"fakeConnection");
      setImmediate(function(){
        if(done < 3) throw new Error('Not all three were done');
        if(done > 3) throw new Error('Its triggering more than once per event');
        next();
      });
    });
  });
};
