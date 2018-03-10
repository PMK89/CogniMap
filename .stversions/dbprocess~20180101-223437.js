const {BrowserWindow, ipcMain } = require('electron');
const { WORST, BEST, CORRECT, calculate, getPercentOverdue } = require('sm2-plus');
const path = require('path');
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
// quiz related
// -----------------------------------------------

var quizes = [];
var quizcmes = [];
var quizesOverdue = [];
var quiz = '';

const DAY_IN_MINISECONDS = 24 * 60 * 60 * 1000;
const getDaysSinceEpoch = () => (
    Math.round(new Date().getTime() / DAY_IN_MINISECONDS)
);

const TODAY = getDaysSinceEpoch();

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
                                if (link.weight === 0) {
                                  selCMElArrayBorder.push(data.id);
                                } else {
                                  selCMElArray.push(data.id);
                                }
                                cmeArray.push(data);
                              } else {
                                console.log("Error (Link) at ParentID: ", cme0.id, " ChildId: ", link.targetId, " LinkId: ", link.id);
                              }
                            }
                          });
                        }
                        var targetIdIndex = selCMEoArray.indexOf(link.targetId);
                        if (targetIdIndex === -1 && link.weight !== 0) {
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
    cme.find({}).sort({cdate: 1}).exec(function(err, data) {
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
    var chng_array = [];
    var data_array = [];
    var logstr = ''

    function unpackData() {
      if (data_array.length > 0) {
        var i;
        const l = data_array.length;
        for (i = 0; i < l; i++) {
          if (data_array[i]) {
            try {
              var cmobject = JSON.parse(data_array[i].cmobject);
              if (data_array[i].id >= 1) {
                if (cmobject.links) {
                  data_array[i].state = cmobject.links.length;
                } else {
                  data_array[i].state = '0';
                }
              } else if (data_array[i].id <= -1) {
                // cme.state = '2';
              }
              chng_array.push(cmobject);
            } catch (err) {
              logstr += 'ID: ' + data_array[i].id + ' Error while parsing cmobject, setting state:  ' + err + '\n';
            }
          }
        }
      }
    }

    function iterate(id, parentarray, catarray) {
      const pos = data_array.findIndex(i => i.id === id);
      if (pos > -1) {
        var cme = data_array[pos];
        if (cme.id !== 1 && cme.cat.length === 0) {
          cme.cat = catarray;
        }
        var linkpos = Number(cme.state);
        if (linkpos > 0) {
          var cmobject = chng_array[pos];
          console.log(id, linkpos, )
          if (linkpos <= cmobject.links.length) {
            var link = cmobject.links[linkpos - 1];
            if (link.weight) {
              parentarray.push(cme.id);
              if (cme.id !== 1 && catarray.length <= 7) {
                catarray.push(cme.title);
              }
              var state = String(linkpos - 1);
              if (state !== undefined) {
                cme.state = state;
              } else {
                logstr += 'Undefined shit ID: ' + id + 'linkpos: ' + linkpos + ' Error: unexpected state \n';
              }
              data_array[pos] = cme;
              if (link.targetId > 0) {
                iterate(link.targetId, parentarray, catarray);
              } else {
                if (parentarray.length > 0) {
                  var oldid = parentarray.pop();
                  iterate(oldid, parentarray, catarray);
                }
              }
            } else {
              if (parentarray.length > 0) {
                var oldid = parentarray.pop();
                iterate(oldid, parentarray, catarray);
              }
            }
          }
        } else {
          if (cme.state === '0') {
            cme.state = '';
            data_array[pos] = cme;
            if (parentarray.length > 0) {
              var oldid = parentarray.pop();
              iterate(oldid, parentarray, catarray);
            }
          } else {
            logstr += 'ID: ' + id + 'parentarray: ' + parentarray + 'catarray: ' + catarray + ' Error: unexpected state \n';
            if (parentarray.length > 0) {
              var oldid = parentarray.pop();
              iterate(oldid, parentarray, catarray);
            }
          }
        }
      } else {
        logstr += 'ID: ' + id + 'parentarray: ' + parentarray + 'catarray: ' + catarray + ' Error: ID not found \n';
        if (parentarray.length > 0) {
          var oldid = parentarray.pop();
          iterate(oldid, parentarray, catarray);
        }
      }
    }

    function saveData() {
      if (data_array.length > 0) {
        var i;
        const l = data_array.length;
        for (i = 0; i < l; i++) {
          if (data_array[i]) {
            var cme = data_array[i];
            try {
              cme.cmobject = JSON.stringify(cme.cmobject);
              if (cme.state !== '') {
                logstr += 'ID: ' + cme.id + ' had an unexpected state of: ' + cme.state + '\n';
                cme.state = '';
              }
              data_array[i] = cme;
              data_array[i].save(function (err) {
                if (err) {
                  logstr += 'ID: ' + cme.id + ' Error while saving to DB: ' + err + '\n';
                  console.log(err) // #error message
                }
              });
            } catch (err) {
              logstr += 'ID: ' + cme.id + ' Error while stringify cmobject: ' + err + '\n';
            }
          }
        }
      }
    }

    function makeCat() {
      logstr += 'Categorizing Error-Log\n\n';
      logstr += 'Errors while parsing DB-Data\n';
      unpackData();
      logstr += 'Errors while iterating\n';
      iterate(1, [], []);
      logstr += 'Errors while saving DB\n';
      saveData();
      fs.writeFileSync('./data/catlog.txt', logstr);
      event.returnValue = 'changed elements ';
    }

    cme.find({}, function(err, data) {
      if (err) console.log(err);
      if (data) {
          data_array = data;
          makeCat();
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
    var regextitle = RegExp(arg, 'i');
    console.log(regextitle);
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
    if (arg.types[0] === 'q') {
      var cmo = JSON.parse(arg.cmobject);
      if (cmo['style']['object']['weight'] && cmo['style']['object']['str']) {
        var dif = cmo['style']['object']['weight'];
        var int = Number(cmo['style']['object']['str']);
        if (typeof dif === 'number' && typeof int === 'number') {
          if (dif > 0 && dif <= 1) {
            changeQuiz(arg.id, dif, int);
          }
        }
      }
    }
    cme.findOne({id: arg.id}, function(err, data) {
		  if (err) console.log(err);
      if (data) {
        datahistoryController(data, 'insert');
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
    const t0 = Date.now();
    console.log('loadCME start: ', t0);
    const l = parseInt(arg.l);
	  const t = parseInt(arg.t);
	  const r = parseInt(arg.r);
	  const b = parseInt(arg.b);
	  // gets all elements within a expanded user view. Maybe should be made better
	  cme.find({
      $or: [
        {$and: [{x0: { $gt: l, $lt: r }}, {y0: { $gt: t, $lt: b }}]},
        {$and: [{x1: { $gt: l, $lt: r }}, {y1: { $gt: t, $lt: b }}]}
      ]
		}, function(err, data) {
		  if (err) console.log(err);
		  event.sender.send('loadedCME', data);
      console.log('loadCME end: ', (Date.now() - t0));
	  });
  })

  // creates new CME in Database
  ipcMain.on('newCME', (event, arg) => {
    if (arg.types[0] === 'q') {
      var cmo = JSON.parse(arg.cmobject);
      if (cmo['style']['object']['weight'] && cmo['style']['object']['str']) {
        var dif = cmo['style']['object']['weight'];
        var int = Number(cmo['style']['object']['str']);
        if (typeof dif === 'number' && typeof int === 'number') {
          if (dif > 0 && dif <= 1) {
            makeQuiz(arg.id, dif, int);
          }
        }
      }
    }
    var ncme = new cme(arg);
    // console.log(ncme);
    ncme.save(function (err) {
      if (err) {
        console.log(err) // #error message
      } else {
        ncme.state = 'new';
        datahistoryController(ncme, 'insert');
        console.log(arg.id)
      }
		});
  })

  // loads quizes that are due
  ipcMain.on('loadQuizes', (event, arg) => {
    if (quizes.length === 0) {
      loadQuizes();
    }
    const today = TODAY;
    var overduearray = [];
    quizes.forEach((quiz) => {
      if (quiz) {
        var overdue = getPercentOverdue(quiz, today);
        console.log(overdue);
        if (overdue >= 0) {
          overduearray.push({id: quiz.id, od: overdue});
        }
      }
    })
    if (overduearray.length > 0) {
      overduearray.sort(function(a, b){return b.od - a.od});
      overduearray.forEach((e) => {quizesOverdue.push(e.id)})
      if (quizesOverdue.length > 0) {
        cme.find({ id: quizesOverdue }, function(err, data) {
    		  if (err) console.log(err);
          var i;
          const l = data.length;
          for (i = 0; i < l; i++) {
            if(data[i]) {
              data[i].types[0] = 'q1';
              data[i].save(function (err) {
                if (err) console.log(err); // #error message
              });
            }
          }
          quizcmes = data;
    		  event.sender.send('loadedQuizes', data);
    	  });
      }
    }
  })

  // unloads quizes that are due and changes type[0] to q again
  ipcMain.on('unQuiz', (event, arg) => {
    if (quizcmes.length > 0) {
      const l = quizcmes.length;
      var i;
      for (i = 0; i < l; i++) {
        if (quizcmes[i]) {
          quizcmes[i].types[0] = 'q';
          quizcmes[i].save(function (err) {
            if (err) console.log(err); // #error message
          });
        }
      }
      quizcmes = []
      event.sender.send('loadedQuizes', quizcmes);
    }
  })


  // answer a quiz and recalculate
  ipcMain.on('answerQuiz', (event, arg) => {
    if (arg['id']) {
      if (quizes.length === 0) {
        loadQuizes();
      }
      var rating = WORST;
      if (arg['scale'] === 0) {
        rating = BEST;
      } else if (arg['scale'] === 1) {
        rating = CORRECT
      }
      var pos = quizes.findIndex(i => i.id === arg['id']);
      if (pos > -1) {
        var calc = calculate(quizes[pos], rating, TODAY);
        if (calc) {
          quizes[pos].difficulty = calc.difficulty;
          quizes[pos].interval = calc.interval;
          quizes[pos].update = calc.update;
          console.info(quizes[pos]);
          var pos0 = quizcmes.findIndex(i => i.id === arg['id']);
          if (pos0 > -1) {
            if (quizcmes[pos0]) {
              var data = quizcmes[pos0];
              datahistoryController(data, 'insert');
              var cmo = JSON.parse(data.cmobject);
              if (cmo['style']['object']['weight'] && cmo['style']['object']['str']) {
                cmo['style']['object']['str'] = String(calc.interval);
                cmo['style']['object']['weight'] = calc.difficulty;
                data.types[0] = 'q';
                data.cmobject = JSON.stringify(cmo);
                // saves changes to database
        				data.save(function (err) {
                  if (err) console.log(err); // #error message
        				});
                quizcmes.splice(pos0, 1);
                event.sender.send('loadedQuizes', quizcmes);
              }
            }
          }
          saveQuizes();
        }
      }
    }
  })

  // deletes CME in Database
  ipcMain.on('delCME', (event, arg) => {
    cme.findOne({id: arg}, function(err, data) {
		  if (err) console.log(err);
      if (data) {
        if (data.state === 'quiz') {
          deleteQuiz(data.id);
        }
        data.state = 'del';
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

// deletes a quiz element
function makeQuiz(id , dif, int) {
  if(id && dif && int) {
    if (quizes.length === 0) {
      loadQuizes();
    }
    if(quizes.findIndex(i => i.id === id) === -1) {
      var newquiz = {
        id: id,
        update: TODAY,
        difficulty: dif,
        interval: int
      };
      quizes.push(newquiz);
      saveQuizes()
    }
  }
}

// changes a quiz element
function changeQuiz(id, dif, int) {
  if(id && dif && int) {
    if (quizes.length === 0) {
      loadQuizes();
    }
    var pos = quizes.findIndex(i => i.id === id);
    if (pos > -1) {
      quizes[pos].difficulty = dif;
      quizes[pos].interval = int;
      saveQuizes();
    } else {
      makeQuiz(id , dif, int);
    }
  }
}

// deletes a quiz element
function deleteQuiz(id) {
  var pos = quizes.findIndex(i => i.id === id);
  if (pos > -1) {
    quizes.splice(pos, 1);
    saveQuizes();
  }
}

// saves quiz array
function saveQuizes() {
  fs.writeFileSync('./data/quizes.json', JSON.stringify(quizes, null, 2));
}

// finds overdue quizes and pushes them to quizesOverdue array
function findOverdueQuizes(quiz, today) {
  if (quiz) {
    var overdue = getPercentOverdue(quiz, today);
    if (overdue > 0) {
      quizesOverdue.push(quiz.id);
    }
  }
}

// loads quiz array from json file
function loadQuizes() {
  if (fs.existsSync('./data/quizes.json')) {
    quizes = JSON.parse(fs.readFileSync('./data/quizes.json'));
  }
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
