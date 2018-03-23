const {BrowserWindow, ipcMain } = require('electron');
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
var quiz = '';

const WORST = 0;
const CORRECT = 0.6;
const BEST = 1;

const DAY_IN_MINISECONDS = 24 * 60 * 60 * 1000;
const getDaysSinceEpoch = () => (
    Math.round(new Date().getTime() / DAY_IN_MINISECONDS)
);

const TODAY = getDaysSinceEpoch();

const limitNumber = (number, min, max) => {
  let ret = number;
  if (number < min) {
    ret = min;
  } else if (number > max) {
    ret = max;
  }

  return ret;
};

const getPercentOverdue = (word, today) => {
  const calculated = (today - word.update) / word.interval;
  return calculated > 2 ? 2 : calculated;
};

const calculate = (word, performanceRating, today) => {
  const percentOverDue = getPercentOverdue(word, today);
  const difficulty = limitNumber(
    word.difficulty + (8 - 9 * performanceRating) * percentOverDue / 17,
                                 0, 1);
  const difficultyWeight = 3 - 1.7 * difficulty;
  let interval;
  if (performanceRating === WORST) {
    interval = Math.round(1 / difficultyWeight / difficultyWeight) || 1;
  } else {
    interval = Math.ceil(Math.pow((1 - difficulty), 3) * word.interval) + Math.round((difficultyWeight - 1) * percentOverDue);
    // console.log(Math.ceil(Math.pow((1 - difficulty), 3) * word.interval), Math.round((difficultyWeight - 1) * percentOverDue), percentOverDue, interval);
  }

  return {
    difficulty,
    interval,
    dueDate: today + interval,
    update: today,
    word: word.word,
  };
};

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
    event.returnValue = 'Not valid';
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

  // changes cme in database
  ipcMain.on('changeCME', (event, arg) => {
    console.log('changeCME start: ', arg.id, Date.now());
    if (arg.types[0] === 'q') {
      var cmo = JSON.parse(arg.cmobject);
      if (cmo['style']['object']['weight'] > -1 && cmo['style']['object']['str']) {
        var dif = cmo['style']['object']['weight'];
        var int = Number(cmo['style']['object']['str']);
        console.log('weight: ' + cmo['style']['object']['weight'] + ' interval: ' + cmo['style']['object']['str']);
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
        if (data.title !== arg.title) {
          findCatChildren(data, data.title, arg.title, event);
        }
        data.coor = arg.coor;
        data.x0 = arg.x0;
        data.y0 = arg.y0;
        data.x1 = arg.x1;
        data.y1 = arg.y1;
        data.prio = arg.prio;
        data.types = arg.types;
        data.cat = arg.cat;
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
      if (cmo['style']['object']['weight'] > -1 && cmo['style']['object']['str']) {
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
    var quizid = [0];
    quizes.forEach((quiz) => {
      if (quiz) {
        var qpos = quizid.indexOf(quiz.id);
        if (qpos > -1) {
          console.log(quiz.id);
        } else {
          quizid.push(quiz.id);
        }
      }
    })
    const today0 = TODAY;
    var overduearray = [];
    quizes.forEach((quiz) => {
      if (quiz) {
        var overdue = getPercentOverdue(quiz, today0);
        // console.log(overdue);
        if (overdue >= 2) {
          // console.log(quiz);
          overduearray.push({id: quiz.id, od: overdue, interval: quiz.interval, dif: quiz.difficulty});
        }
      }
    })
    const l = overduearray.length;
    console.log(l);
    if (l > 0) {
      overduearray.sort(function(a, b){return b.od - a.od});
      getOverdueQuizes(overduearray, event);
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
      quizcmes = [];
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
        var pos0 = quizcmes.findIndex(i => i.id === arg['id']);
        if (pos0 > -1) {
          var calc = calculate(quizes[pos], rating, TODAY);
          if (calc) {
            console.info(quizes[pos]);
            quizes[pos].difficulty = calc.difficulty;
            quizes[pos].interval = calc.interval;
            quizes[pos].update = calc.update;
            console.info(quizes[pos]);
            if (quizcmes[pos0]) {
              var data = quizcmes[pos0];
              datahistoryController(data, 'insert');
              var cmo = JSON.parse(data.cmobject);
              if (cmo['style']['object']['str']) {
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
            saveQuizes();
          }
        }
      }
    }
  })

  // deletes CME in Database
  ipcMain.on('delCME', (event, arg) => {
    cme.findOne({id: arg}, function(err, data) {
		  if (err) console.log(err);
      if (data) {
        if (data.types[0] === 'q' || data.types[0] === 'q1') {
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
  if(id) {
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
  console.log(id, dif, int);
  if(id) {
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

// loads quiz array from json file
function loadQuizes() {
  if (fs.existsSync('./data/quizes.json')) {
    quizes = JSON.parse(fs.readFileSync('./data/quizes.json'));
  }
}

// gets overdue quizzes and sends them to frontend
function getOverdueQuizes(overduearray0, event) {
  overduequiz = overduearray0.shift()
  cme.find({ id: overduequiz.id}, function(err, data0) {
      if (err) console.log(err);
      data = data0[0];
      if (data) {
        data.types[0] = 'q1';
        var cmo = JSON.parse(data.cmobject);
        if (cmo['style']['object']['str']) {
          cmo['style']['object']['str'] = String(overduequiz.interval);
          cmo['style']['object']['weight'] = overduequiz.dif;
          data.cmobject = JSON.stringify(cmo);
          quizcmes.push(data)
          data.save(function (err) {
            if (err) console.log(err); // #error message
          });
          if (overduearray0.length === 0) {
            event.sender.send('loadedQuizes', quizcmes);
          } else {
            getOverdueQuizes(overduearray0, event)
          }
        }
      }
   });
}

// gets all elements with same category
function getByCat(cat0) {
  console.log(cat0);
  cme.find({cat: {
    $elemMatch: cat0
  }}, function(err, data) {
    if (err) {
      console.log(err);
      return [];
    }  else {
      console.log(data);
      return data;
    }
  });
}

// gets all elements with same category
function changeCat(data, title0, title1) {
  const l = data.length;
  var i;
  for (i = 0; i < l; i++) {
    if (data[i]) {
      var catpos = data[i].cat.indexOf(title0);
      if (catpos > -1) {
        console.log(data[i].cat);
        data[i].cat = data[i].cat.splice(catpos, 1, title1)
        console.log(data[i].cat);
        data[i].save(function (err) {
          if (err) console.log(err); // #error message
        });
      }
    }
  }
  return data;
}

// finds child elements with the same category
function findCatChildren(arg, title0, title1, event) {
  // variables to store different types of objects ids
  var selCMEoArray = [];
  var cmeArray = [];
  var endcounter = 0;
  const catl = arg.cat.length;
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
        // console.info(cmeArray);
        event.sender.send('changedCME', cmeArray);
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
            var iscat = false;
            for (var i = 0; i < catl; i++) {
              if (arg.cat[i] && cme0.cat[i]) {
                if (arg.cat[i] === cme0.cat[i] || title0 === cme0.cat[i]) {
                  iscat = true;
                } else {
                  iscat = false
                }
              } else {
                iscat = false
              }
            }
            if (iscat) {
              var catpos = cme0.cat.indexOf(title0);
              if (catpos > -1) {
                cme0.cat[catpos] = title1;
                cme0.save(function (err) {
                  if (err) console.log(err); // #error message
                });
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
                  } else {
                    checkEnd();
                  }
                }
              }
            }
          }
        }
      }
    }
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
