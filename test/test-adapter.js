var Adapter = require("../Adapter");
var asyncfn = function(obj, next){ next(); };
var adapter = new Adapter({
  connection: {create: asyncfn, destroy: asyncfn },
  collection: {
    create: asyncfn,
    request: asyncfn,
    validate: asyncfn,
    update: asyncfn,
    destroy: asyncfn
  },
  instance: {
    create: asyncfn,
    request: asyncfn,
    update: asyncfn,
    destroy: asyncfn
  }
});

module.exports = adapter;