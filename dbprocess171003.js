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

var dbwin
var datahistory = [];


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

  // find all child nodes and returns selected elements
  ipcMain.on('findChildren', function (event, arg) {
    // variables to store different types of objects ids
    var selCMEoArray = [];
    var selCMElArray = [];
    var cmeArray = [];
    var selCMElArrayBorder = [];
    var endcounter = 0;
    waiting = false;
    selectLinks(arg);
    // triggers a timeout to check if new elements were added
    function waitingTime() {
      if (!waiting) {
        waiting = true;
        setTimeout(function() {
          waiting = false;
          checkEnd();
        }, 100);
        return;
      }
    }
    // function to check if the iteration is still in progress
    function checkEnd() {
      if (endcounter === 0) {
        endcounter = Date.now();
      } else {
        if ((Date.now() - endcounter) >= 100) {
          console.log(selCMEoArray.length, selCMElArray.length, cmeArray.length);
          var SelChildren = {
            selCMEoArray: selCMEoArray,
            selCMElArray: selCMElArray,
            selarray: cmeArray,
            selCMElArrayBorder: selCMElArrayBorder
          }
          event.sender.send('selectedChildren', SelChildren);
        } else if (!waiting) {
          endcounter = Date.now();
          waitingTime();
        } else {
          endcounter = Date.now();
        }
      }
    }
    // function to find elements from links
    function selectLinks(cme0) {
      if (cme0) {
        if (typeof cme0.id === 'number') {
          if (cme0.id >= 1) {
            if (selCMEoArray.indexOf(cme0.id) === -1) {
              cmeArray.push(cme0);
              var cmobject;
              if (typeof cme0.cmobject === 'string') {
                cmobject = JSON.parse(cme0.cmobject);
              } else {
                cmobject = cme0.cmobject;
              }
              if (cmobject.links) {
                selCMEoArray.push(cme0.id);
                if (cmobject.links.length > 1) {
                  for (var key in cmobject.links) {
                    if (cmobject.links[key]) {
                      var link = cmobject.links[key];
                      // console.log(link);
                      if (cme0.id === arg.id || link.weight !== 0) {
                        if (cme0.id === arg.id && link.start === false) {
                          cme.findOne({id: link.id}, function(err, data) {
                            if (err) {
                              console.log(err);
                            } else {
                              if (data) {
                                selCMElArrayBorder.push(data.id);
                                cmeArray.push(data);
                              } else {
                                console.log("Error (Border Link) at ParentID: ", cme0.id, " ChildId: ", link.targetId, " LinkId: ", link.id);
                              }
                            }
                          });
                        } else {
                          if (link.id !== 0 && selCMElArray.indexOf(link.id) === -1) {
                            cme.findOne({id: link.id}, function(err, data) {
                              if (err) {
                                console.log(err);
                              } else {
                                if (data) {
                                  selCMElArray.push(data.id);
                                  cmeArray.push(data);
                                } else {
                                  console.log("Error (Link) at ParentID: ", cme0.id, " ChildId: ", link.targetId, " LinkId: ", link.id);
                                }
                              }
                            });
                          }
                          var targetIdIndex = selCMEoArray.indexOf(link.targetId);
                          if (targetIdIndex === -1) {
                            cme.findOne({id: link.targetId}, function(err, data) {
                              if (err) {
                                console.log(err);
                              } else {
                                if (data) {
                                  selectLinks(data);
                                } else {
                                  console.log("Error (Child) at ParentID: ", cme0.id, " ChildId: ", link.targetId, " LinkId: ", link.id);
                                }
                              }
                            });
                          }
                        }
                      }
                    }
                  }
                } else {
                  checkEnd();
                }
              } else {
                selCMEoArray.push(cme0.id);
                console.log("!link id: ", cme0.id);
              }
            }
          }
        }
      }
    }

  })

  // find all cmes in area and returns selected elements sorted for frontend selection
  ipcMain.on('findArea', function (event, arg) {
    // variables to store different types of objects ids
    var ids = [];
    var selCMEoArray = [];
    var selCMElArray = [];
    var cmeArray = [];
    var selCMElArrayBorder = [];
    ids.push(arg.id);
    cmeArray.push(arg);
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
      if (err) {
        console.log(err);
      } else {
        // do something with data
      }
		  event.sender.send('loadedCME', data);
      console.log('loadCME end: ', Date.now());
	  });
      if (nochange) {
        // console.log(cmeArray)
        var SelChildren = {
          ids: ids,
          selCMEoArray: selCMEoArray,
          selCMElArray: selCMElArray,
          selarray: cmeArray,
          selCMElArrayBorder: selCMElArrayBorder
        }
        event.sender.send('selectedChildren', SelChildren);
      }
  })

  // save database to json file
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

  // select from database and write json file
  ipcMain.on('searchDb', function (event, arg) {
    // easy function to change elements in db

    cme.find({}, function(err, data) {
      if (err) console.log(err);
      if (data) {
        var dataArray = [];
        var i;
        var l = data.length;
        var coor0counter = 0;
        var id0counter = 0;
        var objecterrorcounter = 0;
        var lineerrorcounter = 0;
        var linkerrorcounter = 0;
        var linkerrorcounter1 = 0;
        var nolinkerrorcounter = 0;
        var undefinderrorcounter = 0;
        var coor0array = [];
        var id0array = [];
        var objecterrorarray = [];
        var lineerrorarray = [];
        var linkerrorarray = [];
        var linkerrorarray1 = [];
        var nolinkerrorarray = [];
        var undefinderrorarray = [];
        for (i = 0; i < l; i++) {
          var posarray = [];
          if(data[i]) {
            if (data[i].x0 <= 0 || data[i].y0 <= 0 || data[i].x1 <= 0 || data[i].y1 <= 0) {
              // dataArray.push(data[i]);
              // coor0counter++
              // coor0array.push(data[i].id);
            } else {
              if (data[i].id > 0) {
                try {
                  var cmobject = JSON.parse(data[i].cmobject);
                  if (cmobject.links) {
                    if (cmobject.links.length > 0) {
                      for (j = 0; j < cmobject.links.length; j++) {
                        if (cmobject.links[j]) {
                          if (typeof cmobject.links[j].id === 'number' && typeof cmobject.links[j].targetId === 'number') {
                            var linkid0 = (-1) * parseInt(String(data[i].id) + String(cmobject.links[j].targetId), 10);
                            var linkid1 = (-1) * parseInt(String(cmobject.links[j].targetId) + String(data[i].id), 10);
                            var targetCMEarray = data.filter((e) => {
                              return e.id === cmobject.links[j].targetId;
                            });
                            if (cmobject.links[j].id === 0) {
                              if (cmobject.links[j].title === 'marking') {
                                console.log('marking: ', cmobject.links[j]);
                              } else {
                                if (cmobject.links[j].start) {
                                  cmobject.links[j].id = linkid0;
                                } else {
                                  cmobject.links[j].id = linkid1;
                                }
                              }
                            }
                            var linkCMEarray = data.filter((e) => {
                              return e.id === cmobject.links[j].id;
                            });
                            var targetCME = targetCMEarray.pop();
                            var linkCME = linkCMEarray.pop();
                            if (targetCME) {
                              if (targetCME.cmobject) {
                                var tcmobject = JSON.parse(targetCME.cmobject);
                                if (tcmobject.links) {
                                  var nolinks = true;
                                  var errors = false;
                                  for (k = 0; k < tcmobject.links.length; k++) {
                                    if (tcmobject.links[k]) {
                                      tlink = tcmobject.links[k];
                                      if (tlink.id === cmobject.links[j].id || tlink.targetId === data[i].id) {
                                        nolinks = false;
                                        if (tlink.targetId !== data[i].id) {
                                          errors = true;
                                          tlink.targetId = data[i].id;
                                        }
                                        if (tlink.id !== cmobject.links[j].id) {
                                          errors = true;
                                          tlink.id = cmobject.links[j].id;
                                        }
                                      }
                                    }
                                  }
                                  if (nolinks) {
                                    errors = true;
                                    if (linkCME) {
                                      if (linkCME.cmobject) {
                                        var newstart;
                                        if (cmobject.links[j].start) {
                                          newstart = false;
                                        } else {
                                          newstart = true;
                                        }
                                        var newlink = {
                                          id: cmobject.links[j].id,
                                          targetId: data[i].id,
                                          weight: -1,
                                          con: 'e',
                                          start: newstart
                                        }
                                        tcmobject.links.push(newlink);
                                      }
                                    }
                                  }
                                  if (errors) {
                                    linkerrorcounter++;
                                    linkerrorcounter1++;
                                    targetCME.cmobject = JSON.stringify(tcmobject);
                                    linkerrorarray.push(targetCME.id);
                                    dataArray.push(targetCME);
                                    targetCME.save(function (err) {
                                      if (err) {
                                        console.log(err) // #error message
                                      }
                                    });
                                  }
                                }
                              }
                            } else {
                              if (posarray.indexOf(j) === -1) {
                                posarray.push(j);
                              }
                              linkerrorcounter++;
                              linkerrorarray.push(data[i].id);
                              dataArray.push(data[i]);
                            }
                            if (linkCME) {
                              if (linkCME.cmobject) {
                                var lcmobject = JSON.parse(linkCME.cmobject);
                                if (linkCME) {
                                  var errors = false;
                                  if (cmobject.links[j].start) {
                                    if (lcmobject.id0 !== data[i].id) {
                                      errors = true;
                                      lcmobject.id0 = data[i].id;
                                    }
                                    if (lcmobject.id1 !== cmobject.links[j].targetId) {
                                      errors = true;
                                      lcmobject.id1 = cmobject.links[j].targetId;
                                    }
                                  } else {
                                    if (lcmobject.id1 !== data[i].id) {
                                      errors = true;
                                      lcmobject.id1 = data[i].id;
                                    }
                                    if (lcmobject.id0 !== cmobject.links[j].targetId) {
                                      errors = true;
                                      lcmobject.id0 = cmobject.links[j].targetId;
                                    }
                                  }
                                  if (errors) {
                                    linkerrorcounter++;
                                    linkerrorarray.push(linkCME.id);
                                    dataArray.push(linkCME);
                                    linkCME.save(function (err) {
                                      if (err) {
                                        console.log(err) // #error message
                                      }
                                    });
                                  }
                                }
                              }
                            } else {
                              linkerrorcounter++;
                              if (cmobject.links[j].id !== 0) {
                                if (posarray.indexOf(j) === -1) {
                                  posarray.push(j);
                                }
                                linkerrorarray.push(data[i].id);
                                dataArray.push(data[i]);
                              } else {
                                console.log('no delete: ', cmobject.links[j]);
                              }
                            }
                          } else {
                            if (posarray.indexOf(j) === -1) {
                              posarray.push(j);
                            }
                            linkerrorcounter++;
                            console.log(data[i].id, cmobject.links[j].targetId, cmobject.links[j].id);
                          }
                        }
                      }
                    } else {
                      dataArray.push(data[i]);
                      nolinkerrorarray.push(data[i].id)
                      nolinkerrorcounter++;
                    }
                  }
                  if (posarray.length > 0) {
                    for (k = 0; k < posarray.length; k++) {
                      if (posarray[k]) {
                        if (cmobject.links[posarray[k] - k]) {
                          if (cmobject.links[posarray[k] - k] !== undefined) {
                            console.log('deleted: ', cmobject.links[posarray[k] - k]);
                            cmobject.links = cmobject.links.splice((posarray[k] - k), 1);
                            linkerrorcounter1++;
                          }
                        }
                      }
                    }
                    data[i].cmobject = JSON.stringify(cmobject);
                    linkerrorarray1.push(data[i].id);
                    data[i].save(function (err) {
                      if (err) {
                        console.log(err) // #error message
                      }
                    });
                  }
                } catch (err) {
                  dataArray.push(data[i]);
                  objecterrorarray.push(data[i].id)
                  objecterrorcounter++;
                  console.log(err)
                }
              } else {
                try {
                  var cmobject = JSON.parse(data[i].cmobject);
                  if (cmobject) {
                    if (cmobject.id0 <= 0 || cmobject.id1 <= 0) {
                      dataArray.push(data[i]);
                      id0array.push(data[i].id)
                      id0counter++;
                    }
                  } else {
                    dataArray.push(data[i]);
                    lineerrorarray.push(data[i].id)
                    lineerrorcounter++;
                  }
                } catch (err) {
                  undefinderrorcounter++;
                  undefinderrorarray.push(data[i].id)
                  dataArray.push(data[i]);
                  console.log(err)
                }
              }
            }
          }
        }
        fs.writeFileSync('./dist/assets/newdb.json', JSON.stringify(data, null, 2));
        console.log('coor0counter: ', coor0counter, 'id0counter: ', id0counter, 'linkerrorcounter: ', linkerrorcounter,
        'fixed link error: ', linkerrorcounter1, 'nolinkerrorcounter: ', nolinkerrorcounter, 'objecterrorcounter: ',
        objecterrorcounter, 'lineerrorcounter: ', lineerrorcounter, 'undefinderrorcounter: ', undefinderrorcounter);
        var strData = JSON.stringify(dataArray, null, 2);
        var strIdData = 'coor0errors ' + coor0counter + ': \n' + JSON.stringify(coor0array, null, 2) + '\n';
        strIdData += 'id0errors ' + id0counter + ': \n' + JSON.stringify(id0array, null, 2) + '\n';
        strIdData += 'linkerrors ' + linkerrorcounter + ': \n' + JSON.stringify(linkerrorarray, null, 2) + '\n';
        strIdData += 'fixed link errors ' + linkerrorcounter1 + ': \n' + JSON.stringify(linkerrorarray1, null, 2) + '\n';
        strIdData += 'nolinkerrors ' + nolinkerrorcounter + ': \n' + JSON.stringify(nolinkerrorarray, null, 2) + '\n';
        strIdData += 'objecterrors ' + objecterrorcounter + ': \n' + JSON.stringify(objecterrorarray, null, 2) + '\n';
        strIdData += 'lineerrors ' + lineerrorcounter + ': \n' + JSON.stringify(lineerrorarray, null, 2) + '\n';
        strIdData += 'undefinderrors ' + undefinderrorcounter + ': \n' + JSON.stringify(undefinderrorarray, null, 2) + '\n';
        fs.writeFileSync('./dist/assets/errors.json', strData);
        fs.writeFileSync('./dist/assets/errorsid.json', strIdData);
        event.returnValue = 'database saved to ' + arg
      }
    });

  })

  // gets all elements from db
  ipcMain.on('getAllCME', function (event, arg) {
    cme.find({}, function(err, data) {
      if (err) console.log(err);
      if (data) {
        event.returnValue = data;
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

  // get cme by title database
  ipcMain.on('getCMETitle', function (event, arg) {
    var regextitle = RegExp(arg);
    cme.find({title: {$regex: regextitle}}, function(err, data) {
		  if (err) {
        event.returnValue = undefined;
        console.log(err);
      }
      event.returnValue = data;
	  });
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
