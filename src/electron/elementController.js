// reads jsonfile with database


const readDb = function readDb(path) {
  console.log(path)
  if (typeof path === 'string') {
    dbwin = null;
    var db = JSON.parse(fs.readFileSync(path));
    // dbwin = new BrowserWindow({width: 1, height: 1, show: false});

    cme.find({}, function(err, data) {
      if (err) console.log(err);
      if (data) {
        data.remove(function (err) {});
      }
    });

    for (var i = 0; i < db.length; i++) {
  		if(db[i]) {
  			console.log(db[i]);
  			var dbcme = new cme(db[i]);
  			dbcme.save(function (err) {
  				if (err) {
  					console.log(err) // #error message
  				} else {
  					console.log(i)
  				}
  			});
  		}
  	}
  }
}

/* function ReadDatabase() {
	var db = JSON.parse(fs.readFileSync('./data/db170414.json'));
	for (var i = 0; i < db.length; i++) {
		if(db[i]) {
			console.log(db[i]);
			var dbcme = new cme(db[i]);
			dbcme.save(function (err) {
				if (err) {
					console.log(err) // #error message
				} else {
					console.log(i)
				}
			});
		}
	}
} */

// ReadDatabase();
/*
cme.find({}, function(err, data) {
if (err) console.log(err);
console.log(data.length);

var cmei;
for (var i = 0; i < data.length; i++) {
	if (data[i]) {
		cmei = new cme(data[i]);
		cmei.state = '';
		if (cmei.id < -1) {
			var cmeobj = JSON.parse(cmei.cmobject);
			cmeobj.trans = 1;
			cmei.cmobject = JSON.stringify(cmeobj);
		}
		cmei.save(function (err) {
			if (err) {
				console.log(err) // #error message
			} else {
				console.log(i)
			}
		});
	}
}
console.log('database tasks finished');

var str_db = JSON.stringify(data, null, 2);
fs.writeFileSync('./data/dbneu.json', str_db);
});*/
