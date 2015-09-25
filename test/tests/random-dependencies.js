//Example Test

var Manager = require("../../Manager");
var Connection = require("../../Connection");
var Collection = require("../../Collection");

var manager = new Manager();
var adapter = require('../test-adapter');
var connection = manager.loadConnection({name:"fakeConnection"},adapter);

module.exports = function(next){
  var num = 100;
  var ari = [["Model0",{},"fakeConnection"]];
  var l = num-1;
  var bigSchema = {prop0:{type:"objectid",model:"Model0"}};
  while(-1+l--){
    var ll = Math.floor(Math.random()*(num-1))+1;
    var schema = {};
    while(ll--){
      process.stdout.write('.');
      var modelnum;
      while(modelnum === l){
        modelnum = Math.floor(Math.random()*num);
      }
      schema["prop"+ll] = {
        type:"objectid",
        model:"Model"+Math.floor(Math.random()*num)
      };
    }
    bigSchema["prop"+l] = {
      type:"objectid",
      model:"Model"+l
    };
    ari.push(["Model"+l,schema,"fakeConnection"]);
  }
  ari.push(["Model"+(num-1),bigSchema,"fakeConnection"]);

  var shuffledAri = [];
  l = ari.length;
  var done = 0;
  var doneAri = [];
  var doneplus = function(obj){done++;doneAri.push(obj.name);console.log(done)};
  while(l--){
    var item = ari.splice(Math.floor(Math.random*l),1)[0];
    console.log(item);
    ari.push(item);
    manager.once("new-collection["+item[0]+"]",doneplus);
  }


  while(ari.length) manager.loadCollection.apply(manager,ari.pop());

  setImmediate(function(){
    console.log(ari);
    if(done < num) throw new Error('Only '+done+' / '+ num+' were done');
    if(done > num) throw new Error('Something triggered twice');
    var l = num;
    while(l--){
      if(doneAri.indexOf("Model"+l) === -1) throw new Error("correct emits, but missing "+l);
    }
    next();
  });
};
