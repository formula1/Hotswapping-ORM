//Example Test

var wl = new Waterline();

wl.on("new-connection[fakeConnection]",function(){
  throw new Error("this should not happen yet");
})

var connection = wl.loadConnection({name:"fakeConnection",adapter:"fakeAdapter"});

wl.removeAllListeners("new-connection[fakeConnection]");
var adapterDone = false;
wl.on("new-adapter[fakeAdapter]",function(){
  console.log(adapter.state);
  adapterDone = true;
})
wl.on("new-connection[fakeConnection]",function(){
  if(!adapterDone) throw new Error("Connection happened before adapter");
  console.log(connection.state);
})

var adapter = wl.loadAdapter({name:"fakeAdapter"});



wl.on("new-collection[Model1]",function(){
  throw new Error("this should not be working yet");
})
wl.on("new-collection[Model2]",function(){
  throw new Error("this should not be working yet");
})


var schema1 = new Schema({
  prop:{model:"Model2"}
})

var model1 = wl.loadCollection("Model1",schema1,"fakeConnection");

var schema2 = new Schema({
  prop:{model:"Model3"}
})

var model2 = wl.loadCollection("Model2",schema2,"fakeConnection");

var schema3 = new Schema({
  prop:{model:"Model1"}
})

wl.removeAllListeners("new-collection[Model1]");
wl.removeAllListeners("new-collection[Model2]");

wl.on("new-collection[Model1]",function(){
  console.log(model1.state);
})
wl.on("new-collection[Model2]",function(){
  console.log(model2.state);
})
wl.on("new-collection[Model3]",function(){
  console.log(model3.state);
})


var model3 = wl.loadCollection("Model3",schema3,"fakeConnection");
