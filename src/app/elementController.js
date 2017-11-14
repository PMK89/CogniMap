var CMElement0 = require('../models/cmelement');
// handles Databases

var LinvoDB0 = require("linvodb3");
LinvoDB0.dbPath = "./data/element_test20";
var modelName0 = "elements";
// Non-strict always, can be left empty
var schema0 = CMElement0;
var options0 = { };
// options.filename = "./test.db"; // Path to database - not necessary
// options.store = { db: require("level-js") }; // Options passed to LevelUP constructor
console.log(LinvoDB0);
var cmelement0 = new LinvoDB0(modelName0, schema0, options0); // New model; Doc is the constructor

var CMElement = require('../models/element');
// handles Databases

var LinvoDB = require("linvodb3");
LinvoDB.dbPath = "./data/element_test16";
var modelName = "elements";
// Non-strict always, can be left empty
var schema = CMElement;
var options = { };
// options.filename = "./test.db"; // Path to database - not necessary
// options.store = { db: require("level-js") }; // Options passed to LevelUP constructor
console.log(LinvoDB);
var cmelement = new LinvoDB(modelName, schema, options); // New model; Doc is the constructor

	// loads data within specified boundaries
exports.load = function(req, res){
	var l = parseInt(req.query.l);
	var t = parseInt(req.query.t);
	var r = parseInt(req.query.r);
	var b = parseInt(req.query.b);
	// gets all elements within a expanded user view. Maybe should be made better
	cmelement.find({
			$or: [
				{$and: [{x0: { $gt: l, $lt: r }}, {y0: { $gt: t, $lt: b }}]},
				{$and: [{x1: { $gt: l, $lt: r }}, {y1: { $gt: t, $lt: b }}]}
			]
		}, function(err, data) {
		if (err) console.log(err);
		res.jsonp(data);
	});
};

	// changes elements
exports.change = function(req, res){
	//console.log(req);
	if(req.body.id) {
		cmelement.findOne({id: req.body.id}, function(err, data) {
			if (err) console.log(err);
			if (data) {
					data.id = req.body.id;
					data.prio = req.body.prio;
					data.x0 = req.body.x0;
					data.y0 = req.body.y0;
					data.x1 = req.body.x1;
					data.y1 = req.body.y1;
					data.type = req.body.type;
					data.coor = req.body.coor;
					data.cmline = req.body.cmline;
					data.cmobject = req.body.cmobject;
					data.cat = req.body.cat;
					data.z_pos = req.body.z_pos;
	        // saves changes to database
					data.save(function (err) {
						console.log(err);
					});
					res.jsonp(data);
      }
    });
  }
};
	// finds element by id
exports.findid = function(req, res){
	cmelement.findOne({id: parseInt(req.query.id)}, function(err, data) {
		if (err) console.log(err);
		res.jsonp(data);
	});
};

// deactivates element by id
exports.deactivateID = function(req, res){
cmelement.update({id: parseInt(req.query.id)}, {$set: { active: false }}, function(err, data) {
	if (err) console.log(err);
	res.jsonp(data.id);
});
};

	// finds element by title
exports.findtitle = function(req, res){
	cmelement.find({}, function(err, data) {
		if (err) console.log(err);
		for (var i = 0; i < data.length; i++) {
			if (data[i]) {
				var cme = new cmelement0;
				cme.id = data[i].id;
				cme.prio = data[i].prio;
				cme.x0 = data[i].x0;
				cme.y0 = data[i].y0;
				cme.x1 = data[i].x1;
				cme.y1 = data[i].y1;
				cme.types = [data[i].type, '', ''];
				cme.title = data[i].title;
				cme.coor = data[i].coor;
				cme.cmline = JSON.stringify(data[i].cmline);
				cme.cmobject = JSON.stringify(data[i].cmobject);
				cme.cat = data[i].cat;
				cme.z_pos = data[i].z_pos;
				if (data[i].cmobject.style.object.shape) {
					cme.types[1] = data[i].cmobject.style.object.shape;
				}
				console.log(cme);
				cme.save(function (err) {
					console.log(err) // #error message
				});
			}
		}
	});
};

	//finds highest id
exports.findmax = function(req, res){
	cmelement.find({}).sort({id: -1}).limit(1).exec(function(err, data) {
		if (err) console.log(err);
		var max = data[0].id;
		res.jsonp(max);
	});
};

// generates new element
exports.newelement = function(req, res){
  if(req.body.id) {
    var cme = new cmelement;
    cme = req.body;
    cme.save(function (err) {
			console.log(err) // #error message
		});
  }
}
