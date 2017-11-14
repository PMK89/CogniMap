const {BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const LinvoDB = require('linvodb3');
const fs = require('fs');
console.log(LinvoDB);
LinvoDB.dbPath = path.join(__dirname, 'data/cme');
console.log(LinvoDB.dbPath);
const CME = require('./models/CMEdb');
var modelName = "cmes";
var schema = CME;
var options = { };
var cme = new LinvoDB(modelName, schema, options);

let dbwin
let datahistory = [];


// -----------------------------------------------
// creates background window for Database handling
// -----------------------------------------------


const createDbWindow = function createDbWindow() {
  // Create the browser window.
  dbwin = new BrowserWindow({width: 1, height: 1, show: false})
  console.log('dbWindow')

    // Emitted when the window is closed.
  dbwin.on('closed', () => {
    dbwin = null
  });

  // delete database
  ipcMain.on('saveDb', function (event, arg) {
    // easy function to change elements in db
    /*
    cme.find({}, function(err, data) {
      if (err) console.log(err);
      if (data) {
        var i;
        var l = data.length;
        for (i = 0; i < l; i++) {
          if(data[i]) {
            if (data[i].id > 0) {
              try {
                var cmobject = JSON.parse(data[i].cmobject);
                if (cmobject.content) {
                  if (cmobject.content[0]) {
                    cmobject.content[0].height = cmobject.content[0].width;
                    cmobject.content[0].width = 100;
                    data[i].cmobject = JSON.stringify(cmobject);
                    data[i].save(function (err) {
                      if (err) {
                        console.log(err) // #error message
                      } else {
                        console.log('changedCME: ')
                      }
            				});
                  }
                }
              } catch (err) {
                console.log(err)
              }
            }
          }
        }
      }
    });
    */
    cme.find({}, function(err, data) {
      if (err) console.log(err);
      if (data) {
        var dataArray = [];
        var i;
        var l = data.length;
        for (i = 0; i < l; i++) {
          if(data[i]) {
            dataArray.push(data[i]);
          }
        }
        var strData = JSON.stringify(dataArray, null, 2);
        fs.writeFileSync(arg, strData);
        event.returnValue = 'database saved to ' + arg
      }
    });  
  })

  // load database
  ipcMain.on('loadDb', function (event, arg) {
    var db = JSON.parse(fs.readFileSync(arg));

    var i;
    var l = db.length;
    for (i = 0; i < l; i++) {
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
    event.returnValue = 'database loaded'
  })

  // delete database
  ipcMain.on('deleteDb', function (event, arg) {
    cme.find({}, function(err, data) {
      if (err) console.log(err);
      if (data) {
        for (var i = 0; i < data.length; i++) {
          if(data[i]) {
            data[i].remove(function (err) {});
          }
        }
      }
    });
    event.returnValue = 'database deleted'
  })

  // get cme by id database
  ipcMain.on('getCME', function (event, arg) {
    cme.findOne({id: arg}, function(err, data) {
		  if (err) {
        event.returnValue = undefined;
        console.log(err);
      }
      event.returnValue = data;
	  });
  })
  /*
  ipcMain.on('getCME', (event, arg) => {
    // console.log('Parameters: ', arg);
    cme.findOne({id: arg.id}, function(err, data) {
		  if (err) console.log(err);
      event.sender.send('gotCME', data);
	  });
  })*/

  // changes cme in database
  ipcMain.on('changeCME', (event, arg) => {
    console.log('changeCME start: ', arg.id, Date.now());
    cme.findOne({id: arg.id}, function(err, data) {
		  if (err) console.log(err);
      if (data) {
        data.coor = arg.coor;
        data.x0 = arg.x0;
        data.y0 = arg.y0;
        data.x1 = arg.x1;
        data.y1 = arg.y1;
        data.prio = arg.prio;
        data.types = arg.types;
        data.cmobject = arg.cmobject;
        data.cdate = arg.cdate;
        data.vdate = arg.vdate;
        data.title = arg.title;
        data.state = arg.state;
        data.prep = arg.prep;
        data.prep1 = arg.prep1;
        datahistoryController(data, 'insert');
        // saves changes to database
				data.save(function (err) {
          if (err) {
            console.log(err) // #error message
          } else {
            console.log('changeCME end: ', arg.id, Date.now())
          }
				});
        event.sender.send('changedCME', data.id);
      }
	  });
  })

  // get highest ID
  ipcMain.on('maxID', (event, arg) => {
    // console.log('Parameters: ', arg);
    cme.find({}).sort({id: -1}).limit(1).exec(function(err, data) {
		  if (err) console.log(err);
      if (data[0]) {
        var max = data[0].id;
        event.returnValue = max;
      } else {
        event.returnValue = 'error: no data[0]';
      }
	  });
  })

  // finds cmes within given boundaries
  ipcMain.on('loadCME', (event, arg) => {
    console.log('loadCME start: ', Date.now());
    var l = parseInt(arg.l);
	  var t = parseInt(arg.t);
	  var r = parseInt(arg.r);
	  var b = parseInt(arg.b);
	  // gets all elements within a expanded user view. Maybe should be made better
	  cme.find({
			$or: [
				{$and: [{x0: { $gt: l, $lt: r }}, {y0: { $gt: t, $lt: b }}]},
				{$and: [{x1: { $gt: l, $lt: r }}, {y1: { $gt: t, $lt: b }}]}
			]
		}, function(err, data) {
		  if (err) console.log(err);
		  event.sender.send('loadedCME', data);
      console.log('loadCME end: ', Date.now());
	  });
  })

  // creates new CME in Database
  ipcMain.on('newCME', (event, arg) => {
    var ncme = new cme(arg);
    // console.log(ncme);
    ncme.save(function (err) {
      if (err) {
        console.log(err) // #error message
      } else {
        console.log(arg.id)
      }
		});
  })

  // deletes CME in Database
  ipcMain.on('delCME', (event, arg) => {
    cme.findOne({id: arg}, function(err, data) {
		  if (err) console.log(err);
      if (data) {
        datahistoryController(data, 'insert');
        data.remove(function (err) {
				});
        event.sender.send('deletedCME', arg);
      }
	  });
  })

  // closes window when mainWindow is closed
  ipcMain.on('WinClosed', () => {
    console.log('WinClosed'),
    dbwin = null
  });
}


// saves and retrieves changes in the database
function datahistoryController(data, ident) {
  if (ident === 'insert') {
    if (datahistory.length <= 1000) {
      datahistory.push(data);
    } else {
      datahistory.shift();
      datahistory.push(data);
    }
  } else if (ident === 'retrieve') {
    return datahistory.pop();
  }
}

module.exports = createDbWindow;
