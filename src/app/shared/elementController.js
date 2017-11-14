const CMElement = require('./models/cmelement');
const path = require('path');
const jsonp = require('jsonp');
const Rx = require('rxjs')

// handles Databases
const LinvoDB = require('linvodb3');
console.log(LinvoDB);
LinvoDB.dbPath = path.join(__dirname, 'data/element_test21');
console.log(LinvoDB.dbPath);
var modelName = "elements";
var schema = CMElement;
var options = { };
var cmelement = new LinvoDB(modelName, schema, options); // New model; Doc is the constructor

// var cmelement = void;
// loads data within specified boundaries
exports.load = function(parameters){
	// console.log(parameters);
	return Rx.Observable.create(observer => {
    var l = parseInt(parameters.l);
    var t = parseInt(parameters.t);
    var r = parseInt(parameters.r);
    var b = parseInt(parameters.b);
    return cmelement.find({
            $or: [
                {$and: [{x0: { $gt: l, $lt: r }}, {y0: { $gt: t, $lt: b }}]},
                {$and: [{x1: { $gt: l, $lt: r }}, {y1: { $gt: t, $lt: b }}]}
            ]
        }).filter(function(x){ return x !== undefined })
        .exec(function (err, doc) {
            // console.log(doc); // outputs the correct data
            observer.next(doc);
            observer.complete();
        });
  });
};

// changes elements
exports.change = function(cme){
	//console.log(req);
	if(cme.id) {
    return Rx.Observable.create(observer => {
      return cmelement.findOne({id: cme.id}, function(err, data) {
        if (err) console.log(err);
        if (data) {
            data.id = cme.id;
            data.prio = cme.prio;
            data.x0 = cme.x0;
            data.y0 = cme.y0;
            data.x1 = cme.x1;
            data.y1 = cme.y1;
            data.types = cme.types;
            data.coor = cme.coor;
            data.cmline = JSON.stringify(cme.cmline);
            data.cmobject = JSON.stringify(cme.cmobject);
            data.cat = cme.cat;
            data.z_pos = cme.z_pos;
            // saves changes to database
            data.save(function (err) {
              console.log(err);
            })
          }
        }).exec(function (err, doc) {
            // console.log(doc); // outputs the correct data
            observer.next(doc);
            observer.complete();
        });
    });
  }
};

//finds highest id
exports.findmax = function(){
  return Rx.Observable.create(observer => {
    return cmelement
      .find({})
      .sort({id: -1})
      .limit(1)
      .exec(function(err, data) {
        if (err) console.log(err);
        var max = data[0].id;
        console.log('max id: ', max);
        observer.next(max);
        observer.complete();
      });
    });
};

// find data within specified parameter
exports.test = function(test){
  return Rx.Observable.create(observer => {
    let resp = 'electron: ' + test;
    observer.next(resp);
    observer.complete();
  });
};

// generates new element
exports.newelement = function(cme){
  if(cme.id) {
    return Rx.Observable.create(observer => {
      var data = new cmelement;
      data.id = cme.id;
      data.prio = cme.prio;
      data.x0 = cme.x0;
      data.y0 = cme.y0;
      data.x1 = cme.x1;
      data.y1 = cme.y1;
      data.types = cme.types;
      data.coor = cme.coor;
      data.cmline = JSON.stringify(cme.cmline);
      data.cmobject = JSON.stringify(cme.cmobject);
      data.cat = cme.cat;
      data.z_pos = cme.z_pos;
      data.save(function (err) {
  			console.log(err) // #error message
  		});
      console.log('new cme saved');
      return;
    });
  }
}
