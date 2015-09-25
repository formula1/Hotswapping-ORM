var async = require('async');
var fs = require('fs');
async.eachSeries(fs.readdirSync(__dirname+'/tests'),function(test,next){
  console.log('===========================\n',test,'\n===========================')
  require('./tests/'+test)(next);
});
