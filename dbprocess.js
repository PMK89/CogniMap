const { BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");
// Initialize @electron/remote
const remoteMain = require("@electron/remote/main");

// 1) Import NeDB instead of LinvoDB
const Datastore = require("@seald-io/nedb");

// 2) Create a NeDB instance pointing to a file
//    (If 'data' folder doesn't exist, you may need to create it manually)
const cmeDB = new Datastore({
  filename: path.join(__dirname, "data", "cme.db"),
  autoload: true,
});

// Create a reference to the database instance
const cme = cmeDB;

// Create a model class for CME documents
class CMEDocument {
  constructor(data) {
    Object.assign(this, data);
  }

  save(callback) {
    cmeDB.update({ _id: this._id }, this, { upsert: true }, callback);
  }

  remove(callback) {
    cmeDB.remove({ _id: this._id }, {}, callback);
  }
}

// Optional: Log the database path for debugging
console.log("NeDB database path:", path.join(__dirname, "data", "cme.db"));

var dbwin;
var datahistory = [];

// -----------------------------------------------
// quiz related
// -----------------------------------------------

var quizes = [];
var quizcmes = [];
var quiztime = [];
var quizcat = [];
var quiz = "";
var quizbool = true;
var quizclick = 0;

const WORST = 0;
const BAD = 1;
const FLAWED = 2;
const CORRECT = 3;
const GOOD = 4;
const BEST = 5;

const DAY_IN_MINISECONDS = 24 * 60 * 60 * 1000;
const getDaysSinceEpoch = () =>
  Math.round(new Date().getTime() / DAY_IN_MINISECONDS);

var TODAY = getDaysSinceEpoch();

const calculate = (word, performanceRating, today) => {
  var timeinterval;
  var interval;
  var difficulty;
  if (performanceRating < 3) {
    difficulty = word.difficulty;
    interval = 1;
  } else {
    difficulty = Math.max(
      word.difficulty +
        (0.1 -
          (5 - performanceRating) * (0.08 + (5 - performanceRating) * 0.02)),
      1.3
    );
    if (word.interval === 1) {
      timeinterval = 1;
    } else if (word.interval === 2) {
      timeinterval = 6;
    } else {
      timeinterval = Math.max(Math.ceil((word.interval - 1) * difficulty), 6);
      // console.log(Math.ceil(Math.pow((1 - difficulty), 3) * word.interval), Math.round((difficultyWeight - 1) * percentOverDue), percentOverDue, interval);
    }
    interval = word.interval + 1;
  }
  if (performanceRating < 4) {
    var pos0 = quizcmes.findIndex((i) => i.id === word.id);
    if (pos0 > -1) {
      if (quizcmes[pos0]) {
        timeinterval = -100;
        quizcmes.push(quizcmes[pos0]);
      }
    }
  }
  console.log(difficulty, performanceRating, interval, timeinterval);

  return {
    difficulty: difficulty,
    interval: interval,
    update: today + timeinterval,
    word: word.id,
  };
};

// -----------------------------------------------
// creates background window for Database handling
// -----------------------------------------------

const createDbWindow = function createDbWindow() {
  // Create the browser window.
  dbwin = new BrowserWindow({ 
    width: 1, 
    height: 1, 
    show: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    }
  });
  
  // Enable remote module for this window
  remoteMain.enable(dbwin.webContents);
  
  console.log("dbWindow");

  // Emitted when the window is closed.
  dbwin.on("closed", () => {
    dbwin = null;
  });

  // find all child nodes and returns selected elements
  ipcMain.on("findChildren", function (event, arg) {
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
        setTimeout(function () {
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
        if (Date.now() - endcounter >= 100) {
          console.log(
            selCMEoArray.length,
            selCMElArray.length,
            cmeArray.length
          );
          var SelChildren = {
            selCMEoArray: selCMEoArray,
            selCMElArray: selCMElArray,
            selarray: cmeArray,
            selCMElArrayBorder: selCMElArrayBorder,
            minimap: false,
          };
          event.sender.send("selectedChildren", SelChildren);
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
        if (typeof cme0.id === "number") {
          if (cme0.id >= 1) {
            if (selCMEoArray.indexOf(cme0.id) === -1) {
              cmeArray.push(cme0);
              var cmobject;
              if (typeof cme0.cmobject === "string") {
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
                        cme.findOne({ id: link.id }, function (err, data) {
                          if (err) {
                            console.log(err);
                          } else {
                            if (data) {
                              selCMElArrayBorder.push(data.id);
                              cmeArray.push(data);
                            } else {
                              console.log(
                                "Error (Border Link) at ParentID: ",
                                cme0.id,
                                " ChildId: ",
                                link.targetId,
                                " LinkId: ",
                                link.id
                              );
                            }
                          }
                        });
                      } else {
                        if (
                          link.id !== 0 &&
                          selCMElArray.indexOf(link.id) === -1
                        ) {
                          cme.findOne({ id: link.id }, function (err, data) {
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
                                console.log(
                                  "Error (Link) at ParentID: ",
                                  cme0.id,
                                  " ChildId: ",
                                  link.targetId,
                                  " LinkId: ",
                                  link.id
                                );
                              }
                            }
                          });
                        }
                        var targetIdIndex = selCMEoArray.indexOf(link.targetId);
                        if (targetIdIndex === -1 && link.weight !== 0) {
                          cme.findOne(
                            { id: link.targetId },
                            function (err, data) {
                              if (err) {
                                console.log(err);
                              } else {
                                if (data) {
                                  selectLinks(data);
                                } else {
                                  console.log(
                                    "Error (Child) at ParentID: ",
                                    cme0.id,
                                    " ChildId: ",
                                    link.targetId,
                                    " LinkId: ",
                                    link.id
                                  );
                                }
                              }
                            }
                          );
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
  });

  // find all cmes in area and returns selected elements sorted for frontend selection
  ipcMain.on("findArea", function (event, arg) {
    // variables to store different types of objects ids
    var ids = [];
    var selCMEoArray = [];
    var selCMElArray = [];
    var selCMElArrayBorder = [];
    const l = parseInt(arg.l);
    const t = parseInt(arg.t);
    const r = parseInt(arg.r);
    const b = parseInt(arg.b);
    // console.log(arg, l, t, r, b);
    // gets all elements within a expanded user view. Maybe should be made better
    cme.find(
      {
        $or: [
          { $and: [{ x0: { $gt: l, $lt: r } }, { y0: { $gt: t, $lt: b } }] },
          { $and: [{ x1: { $gt: l, $lt: r } }, { y1: { $gt: t, $lt: b } }] },
        ],
      },
      function (err, data) {
        if (err) {
          console.log(err);
        } else {
          // do something with data
          for (let key in data) {
            if (data[key]) {
              // select elements within the selcted area
              const data0 = data[key];
              if (data0.id >= 1) {
                selCMEoArray.push(data0);
              } else if (data0.id <= -1) {
                if (
                  l < data0.x0 &&
                  data0.x0 < r &&
                  t < data0.y0 &&
                  data0.y0 < b
                ) {
                  if (
                    l < data0.x1 &&
                    data0.x1 < r &&
                    t < data0.y1 &&
                    data0.y1 < b
                  ) {
                    selCMElArray.push(data0);
                  } else {
                    selCMElArrayBorder.push(data0);
                    const pos = data0.cmobject.indexOf("id1");
                    var id = data0.cmobject.slice(pos + 5, pos + 22);
                    id = parseInt(id.slice(0, id.indexOf(",")));
                    ids.push(id);
                  }
                } else if (
                  l < data0.x1 &&
                  data0.x1 < r &&
                  t < data0.y1 &&
                  data0.y1 < b
                ) {
                  selCMElArrayBorder.push(data0);
                  const pos = data0.cmobject.indexOf("id0");
                  var id = data0.cmobject.slice(pos + 5, pos + 22);
                  id = parseInt(id.slice(0, id.indexOf(",")));
                  ids.push(id);
                }
              }
            }
          }
          sendSelection(event, [
            selCMEoArray,
            selCMElArray,
            selCMElArrayBorder,
            ids,
          ]);
        }
      }
    );
  });

  // sends area selection to frontend
  function sendSelection(event, cmearray) {
    var cmeArray = [];
    cme.find({ id: { $in: cmearray[3] } }, function (err, data) {
      if (err) console.log(err);
      if (data) {
        cmeArray = data;
      }
      const SelChildren = {
        selCMEoArray: cmearray[0],
        selCMElArray: cmearray[1],
        selarray: cmeArray,
        selCMElArrayBorder: cmearray[2],
        minimap: true,
      };
      event.sender.send("selectedChildren", SelChildren);
    });
  }

  function iterateDB0(array0, oarray, idarray, i, id, event) {
    if (i < array0.length) {
      if (array0[i].id) {
        cme.findOne({ id: array0[i].id }, function (err, data) {
          if (err) console.log(err);
          if (data) {
            if (
              data.title === array0[i].title &&
              data.cat === array0[i].cat &&
              data.coor === array0[i].coor
            ) {
              console.log("unchanged: ", array0[i].id);
            } else {
              id++;
              array0[i].prep = array0[i].id.toString();
              var parsecmo = JSON.parse(array0[i].cmobject);
              if (parsecmo.links) {
                for (j = 0; j < parsecmo.links.length; j++) {
                  if (parsecmo.links[j]) {
                    if (idarray.indexOf(parsecmo.links[j].id) === -1) {
                      idarray.push(parsecmo.links[j].id);
                    }
                    if (idarray.indexOf(parsecmo.links[j].targetId) === -1) {
                      idarray.push(parsecmo.links[j].targetId);
                    }
                  }
                }
              }
              array0[i].cmobject = parsecmo;
              array0[i].id = id;
              oarray.push(array0[i]);
            }
          }
          i++;
          iterateDB0(array0, oarray, idarray, i, id, event);
        });
      }
    } else {
      console.log(oarray.length, idarray.length);
      getOldCME(oarray, idarray, event);
    }
  }

  function getOldCME(oarray, idarray, event) {
    var changedCMo = [];
    var changedoid = [];
    var changednid = [];
    if (fs.existsSync("./data/newCMl1.json")) {
      var newCMl = JSON.parse(fs.readFileSync("./data/newCMl1.json"));
    }
    cme.find({ id: { $in: idarray } }, function (err, data) {
      if (err) console.log(err);
      if (data) {
        for (i = 0; i < oarray.length; i++) {
          if (oarray[i].cmobject) {
            for (j = 0; j < oarray[i].cmobject.links.length; j++) {
              if (oarray[i].cmobject.links[j]) {
                var link = undefined;
                var partner = undefined;
                newCMl.forEach((e) => {
                  if (e) {
                    if (e.id === oarray[i].cmobject.links[j].id) {
                      link = e;
                    }
                  }
                });
                oarray.forEach((e) => {
                  if (e) {
                    if (
                      e.prep === oarray[i].cmobject.links[j].targetId.toString()
                    ) {
                      partner = e;
                    }
                  }
                });
                if (link && partner) {
                  var newlinkid = 0;
                  var newlinktitle = "";
                  var lcmo = JSON.parse(link.cmobject);
                  if (partner.cmobject) {
                    for (k = 0; k < partner.cmobject.links.length; k++) {
                      if (partner.cmobject.links[k]) {
                        if (partner.cmobject.links[k].id === link.id) {
                          if (oarray[i].cmobject.links[j].start) {
                            newlinkid =
                              -1 *
                              parseInt(
                                String(oarray[i].id) + String(partner.id),
                                10
                              );
                            lcmo.id0 = oarray[i].id;
                            lcmo.title0 = oarray[i].title;
                            lcmo.id1 = partner.id;
                            lcmo.title1 = partner.title;
                            newlinktitle =
                              String(oarray[i].id) + "-" + String(partner.id);
                          } else {
                            newlinkid =
                              -1 *
                              parseInt(
                                String(partner.id) + String(oarray[i].id),
                                10
                              );
                            lcmo.id0 = partner.id;
                            lcmo.title0 = partner.title;
                            lcmo.id1 = oarray[i].id;
                            lcmo.title1 = oarray[i].title;
                            newlinktitle =
                              String(partner.id) + "-" + String(oarray[i].id);
                          }
                          partner.cmobject.links[k].id = newlinkid;
                          partner.cmobject.links[k].targetId = oarray[i].id;
                          partner.cmobject.links[k].title = oarray[i].title;
                          oarray[i].cmobject.links[j].id = newlinkid;
                          oarray[i].cmobject.links[j].targetId = partner.id;
                          oarray[i].cmobject.links[j].title = partner.title;
                          if (changedoid.indexOf(link.id) === -1) {
                            changedoid.push(
                              JSON.parse(JSON.stringify(link.id))
                            );
                          }
                          link.id = newlinkid;
                          link.title = newlinktitle;
                          link.cmobject = lcmo;
                          link.prep = "";
                          link.prep1 = "";
                          if (changedoid.indexOf(oarray[i].id) === -1) {
                            changedoid.push(oarray[i].id);
                          }
                          if (changedoid.indexOf(partner.id) === -1) {
                            changedoid.push(partner.id);
                          }
                          oarray.forEach((e) => {
                            if (e) {
                              if (e.id === partner.id) {
                                e = partner;
                              }
                            }
                          });
                          changedCMo.push(link);
                          link.cmobject = JSON.stringify(lcmo);
                          delete link["_id"];
                          newCME(link, false);
                        }
                      }
                    }
                  }
                } else if (link) {
                  data.forEach((e) => {
                    if (e) {
                      if (e.id === oarray[i].cmobject.links[j].targetId) {
                        partner = e;
                      }
                    }
                  });
                  if (partner) {
                    var ccmo = JSON.parse(partner.cmobject);
                    var lcmo = JSON.parse(link.cmobject);
                    if (ccmo) {
                      for (k = 0; k < ccmo.links.length; k++) {
                        if (ccmo.links[k]) {
                          if (ccmo.links[k].id === link.id) {
                            if (oarray[i].cmobject.links[j].start) {
                              newlinkid =
                                -1 *
                                parseInt(
                                  String(oarray[i].id) + String(partner.id),
                                  10
                                );
                              lcmo.id0 = oarray[i].id;
                              lcmo.title0 = oarray[i].title;
                              lcmo.id1 = partner.id;
                              lcmo.title1 = partner.title;
                              newlinktitle =
                                String(oarray[i].id) + "-" + String(partner.id);
                            } else {
                              newlinkid =
                                -1 *
                                parseInt(
                                  String(partner.id) + String(oarray[i].id),
                                  10
                                );
                              lcmo.id0 = partner.id;
                              lcmo.title0 = partner.title;
                              lcmo.id1 = oarray[i].id;
                              lcmo.title1 = oarray[i].title;
                              newlinktitle =
                                String(partner.id) + "-" + String(oarray[i].id);
                            }
                            ccmo.links[k].id = newlinkid;
                            ccmo.links[k].targetId = oarray[i].id;
                            ccmo.links[k].title = oarray[i].title;
                            oarray[i].cmobject.links[j].id = newlinkid;
                            oarray[i].cmobject.links[j].targetId = partner.id;
                            oarray[i].cmobject.links[j].title = partner.title;
                            if (changedoid.indexOf(link.id) === -1) {
                              changedoid.push(
                                JSON.parse(JSON.stringify(link.id))
                              );
                            }
                            link.id = newlinkid;
                            link.title = newlinktitle;
                            partner.cmobject = JSON.stringify(ccmo);
                            link.cmobject = lcmo;
                            link.prep = "";
                            link.prep1 = "";
                            if (changedoid.indexOf(oarray[i].id) === -1) {
                              changedoid.push(oarray[i].id);
                            }
                            if (changednid.indexOf(partner.id) === -1) {
                              changednid.push(partner.id);
                            }
                            data.forEach((e) => {
                              if (e) {
                                if (e.id === partner.id) {
                                  e = partner;
                                }
                              }
                            });
                            changedCMo.push(link);
                            link.cmobject = JSON.stringify(lcmo);
                            delete link["_id"];
                            newCME(link, false);
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
        var dellinks = [];
        var changedCMold = [];
        var changedCMnew = [];
        for (i = 0; i < changedoid.length; i++) {
          if (changedoid[i]) {
            if (changedoid[i] > 1) {
              oarray.forEach((e) => {
                if (e) {
                  if (e.id === changedoid[i]) {
                    changedCMnew.push(e);
                    const scmo = JSON.stringify(e.cmobject);
                    e.cmobject = scmo;
                    e.prep = "";
                    delete e["_id"];
                    newCME(e, false);
                  }
                }
              });
            } else {
              dellinks.push(changedoid[i]);
            }
          }
        }
        for (i = 0; i < changednid.length; i++) {
          if (changednid[i]) {
            data.forEach((e) => {
              if (e) {
                if (e.id === changednid[i]) {
                  changedCMold.push(e);
                  delete e["_id"];
                  e.prep = "";
                  changeCME(e, false);
                }
              }
            });
          }
        }
        event.returnValue = {
          changedlinks: changedCMo,
          changedold: changedCMold,
          changednew: changedCMnew,
          deletedlinks: dellinks,
          previousarray: oarray,
        };
      }
    });
  }

  // save database to json file
  ipcMain.on("saveDb", function (event, arg) {
    cme
      .find({})
      .sort({ cdate: 1 })
      .exec(function (err, data) {
        if (err) console.log(err);
        if (data) {
          var dataArray = [];
          //var newCMoArray = [];
          //var newCMlArray = [];
          //var newCMlIDArray = [];
          var i;
          var l = data.length;
          for (i = 0; i < l; i++) {
            if (data[i]) {
              /*
            // Database compromised by sync try to fix it by extracting doubled elements
            if (data[i].id > 27505) {
              var cmobject = JSON.parse(data[i].cmobject);
              if (cmobject.links) {
                for (j = 0; j < cmobject.links.length; j++) {
                  if (cmobject.links[j]) {
                    if (newCMlIDArray.indexOf(cmobject.links[j].id) === -1) {
                      newCMlIDArray.push(cmobject.links[j].id)
                      console.log(cmobject.links[j].id)
                    }
                  }
                }
                newCMoArray.push(data[i])
              }
            }

            // make categories
            if (data[i].cat) {
              if (data[i].cat.length > 1) {
                var prevdata = '';
                var newcat = [];
                for (j = 0; j < data[i].cat.length; j++) {
                  if (data[i].cat[j] !== prevdata) {
                    newcat.push(data[i].cat[j]);
                    prevdata = data[i].cat[j];
                  }
                }
                data[i].cat = newcat;
              }
            }
            var pos = quizes.findIndex(k => k.id === data[i].id);
            if (pos > -1) {
              quizes[pos].cat = newcat;
              if (quizes[pos].cat.length > 3) {
                quizes[pos].cat = quizes[pos].cat.slice(0, 3);
              } else {
                var cat = quizes[pos].cat.slice();
                for (var i = 0; i < (3 - quizes[pos].cat.length); i++) {
                  cat.push('none');
                }
                quizes[pos].cat = cat;
              }
            }
            */
              dataArray.push(data[i]);
            }
          }
          /*
        cme.find({id: { $in: newCMlIDArray}}, function(err, data) {
          if (err) console.log(err);
          if (data) {
            newCMlArray = data;
            var strDataO = JSON.stringify(newCMoArray, null, 2);
            fs.writeFileSync('./data/newCMo.json', strDataO);
            var strDataL = JSON.stringify(newCMlArray, null, 2);
            fs.writeFileSync('./data/newCMl.json', strDataL);
          }
        });
        */
          var strData = JSON.stringify(dataArray, null, 2);
          fs.writeFileSync(arg, strData);
          // saveQuizes();
          event.returnValue = "database saved to " + arg;
        }
      });
  });

  // save minimap to json file
  ipcMain.on("saveMM", function (event, arg) {
    var strData = JSON.stringify(arg, null, 2);
    fs.writeFileSync("./data/minimap.json", strData);
    event.returnValue = true;
  });

  // load minimap from json file
  ipcMain.on("loadMM", function (event, arg) {
    var mmData = JSON.parse(fs.readFileSync("./data/minimap.json"));
    event.sender.send("loadedMM", mmData);
  });

  // select from database and write json file
  ipcMain.on("searchDb", function (event, arg) {
    /*
    if (fs.existsSync('./data/newCMo1.json')) {
      var newCMo = JSON.parse(fs.readFileSync('./data/newCMo1.json'));
    }
    var newID = 27800;
    if (newCMo) {
      iterateDB0(newCMo, [], [], 0, newID, event);
    }
    */
  });

  // gets all elements from db with certain priority
  ipcMain.on("getAllPrio", function (event, arg) {
    cme.find({ prio: arg }, function (err, data) {
      if (err) console.log(err);
      if (data) {
        event.returnValue = data;
      }
    });
  });

  // gets all elements since date
  ipcMain.on("getSince", function (event, arg) {
    cme.find({ vdate: { $gt: arg } }, function (err, data) {
      if (err) console.log(err);
      if (data) {
        event.sender.send("changedSince", data);
      }
    });
  });

  // gets all elements with id higher than provided argument
  ipcMain.on("getMaxID", function (event, arg) {
    cme
      .find({ id: { $gt: arg } })
      .sort({ id: -1 })
      .exec(function (err, data) {
        if (err) console.log(err);
        if (data) {
          console.log(data, arg);
          if (data.length > 0) {
            console.log(data[0].id, data[data.length - 1].id);
            event.sender.send("maxID", data[0].id);
          } else {
            event.sender.send("maxID", arg);
          }
        } else {
          event.sender.send("maxID", arg);
        }
      });
  });

  // load database
  ipcMain.on("loadDb", function (event, arg) {
    // syncQuiz();
    var db = JSON.parse(fs.readFileSync(arg));
    var i;
    var l = db.length;
    for (i = 0; i < l; i++) {
      if (db[i]) {
        console.log(db[i]);
        cme.insert(db[i], function (err) {
          if (err) {
            console.log(err); // #error message
          } else {
            console.log(i);
          }
        });
      }
    }
    event.returnValue = "database loaded";
  });

  // delete database
  ipcMain.on("deleteDb", function (event, arg) {
    cme.find({}, function (err, data) {
      if (err) console.log(err);
      if (data) {
        for (var i = 0; i < data.length; i++) {
          if (data[i]) {
            data[i].remove(function (err) {});
          }
        }
      }
    });
    event.returnValue = "database deleted";
  });

  // get cme by title database
  ipcMain.on("getCMETitle", function (event, arg) {
    var regextitle = RegExp(arg, "i");
    console.log(regextitle);
    cme.find({ title: { $regex: regextitle } }, function (err, data) {
      if (err) {
        event.returnValue = undefined;
        console.log(err);
      }
      event.returnValue = data;
    });
  });

  // get cme by id database
  ipcMain.on("getCME", function (event, arg) {
    cme.findOne({ id: arg }, function (err, data) {
      if (err) {
        event.returnValue = undefined;
        console.log(err);
      }
      event.returnValue = data;
    });
  });

  // changes cme in database
  function changeCME(arg, event) {
    // console.log('changeCME start: ', arg.id, Date.now());
    if (arg.types[0] === "q") {
      var cmo = JSON.parse(arg.cmobject);
      if (
        cmo["style"]["object"]["weight"] > -1 &&
        cmo["style"]["object"]["str"]
      ) {
        var dif = cmo["style"]["object"]["weight"];
        var int = Number(cmo["style"]["object"]["str"]);
        console.log(
          "weight: " +
            cmo["style"]["object"]["weight"] +
            " interval: " +
            cmo["style"]["object"]["str"]
        );
        if (typeof dif === "number" && typeof int === "number") {
          if (dif >= 1.3) {
            changeQuiz(arg.id, dif, int, arg.cat);
          }
        }
      }
    }
    cme.findOne({ id: arg.id }, function (err, data) {
      if (err) console.log(err);
      if (data) {
        datahistoryController(data, "insert");
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
        data.vdate = Date.now();
        data.title = arg.title;
        data.state = arg.state;
        data.prep = arg.prep;
        data.prep1 = arg.prep1;
        // saves changes to database
        cme.update({ id: arg.id }, data, { upsert: true }, function (err, numAffected, affectedDocs, upsert) {
          if (err) {
            console.error('Error updating CME:', err, data);
            if (event) event.sender.send("changedCME", { error: true, message: err.message, data });
          } else {
            console.log('CME updated:', data);
            if (event) event.sender.send("changedCME", data);
          }
        });
        if (event) {
          event.sender.send("changedCME", data);
        } else {
          console.log(data.id);
        }
      }
    });
  }
  ipcMain.on("changeCME", (event, arg) => {
    changeCME(arg, event);
  });

  // finds cmes within given boundaries
  ipcMain.on("loadCME", (event, arg) => {
    // cleanDB();
    const t0 = Date.now();
    console.log("loadCME start: ", t0);
    const l = parseInt(arg.l);
    const t = parseInt(arg.t);
    const r = parseInt(arg.r);
    const b = parseInt(arg.b);
    // gets all elements within a expanded user view. Maybe should made better
    cme.find(
      {
        $or: [
          { $and: [{ x0: { $gt: l, $lt: r } }, { y0: { $gt: t, $lt: b } }] },
          { $and: [{ x1: { $gt: l, $lt: r } }, { y1: { $gt: t, $lt: b } }] },
        ],
      },
      function (err, data) {
        if (err) console.log(err);
        event.sender.send("loadedCME", data);
        console.log("loadCME end: ", Date.now() - t0);
      }
    );
  });

  // creates new CME in Database
  function newCME(arg, event) {
    if (arg.types[0] === "q") {
      var cmo = JSON.parse(arg.cmobject);
      if (
        cmo["style"]["object"]["weight"] > -1 &&
        cmo["style"]["object"]["str"]
      ) {
        var dif = cmo["style"]["object"]["weight"];
        var int = Number(cmo["style"]["object"]["str"]);
        if (typeof dif === "number" && typeof int === "number") {
          if (dif >= 1.3) {
            makeQuiz(arg.id, dif, int, arg.cat);
          }
        }
      }
    }
    console.log(arg);
    cme.insert(arg, function (err) {
      if (err) {
        console.log(err); // #error message
      } else {
        console.log(arg);
      }
    });
  }

  ipcMain.on("newCME", (event, arg) => {
    newCME(arg, event);
  });

  // loads quizes that are due
  ipcMain.on("loadQuizes", (event, arg) => {
    if (quizbool) {
      quizbool = false;
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
      });
      const today0 = TODAY + quizclick;
      var overduearray = [];
      quizcat = [];
      quizcmes = [];
      quizes.forEach((quiz) => {
        if (quiz) {
          // console.log(overdue);

          if (quiz.cat.length > 3) {
            quiz.cat = quiz.cat.slice(0, 3);
          } else {
            var cat = quiz.cat.slice();
            for (var i = 0; i < 3 - quiz.cat.length; i++) {
              cat.push("none");
            }
            quiz.cat = cat;
          }

          quizcat.push(quiz.cat.slice());
          var quizcatlen = quizcat.length;
          if (today0 >= quiz.update) {
            // console.log(quiz);
            if (quizcatlen > 0) {
              quizcat[quizcatlen - 1].push(quiz.id);
            }
            overduearray.push({
              id: quiz.id,
              od: today0 - quiz.update,
              interval: quiz.interval,
              dif: quiz.difficulty,
            });
          } else {
            const dueday = quiz.update - today0;
            if (quiztime[dueday]) {
              quiztime[dueday] += 1;
            } else {
              quiztime[dueday] = 1;
            }
          }
        }
      });
      const l = overduearray.length;
      console.log(l);
      if (l > 0) {
        overduearray.sort(function (a, b) {
          return b.od - a.od;
        });
        overduearray.splice(arg);
      }
      getOverdueQuizes(overduearray, event);
    }
  });

  // loads quizes that are due
  ipcMain.on("loadQuizesbyCat", (event, arg) => {
    if (quizbool) {
      quizbool = false;
      if (quizes.length === 0) {
        loadQuizes();
      }
      const today0 = TODAY;
      var overduearray = [];
      console.log(arg);
      quizes.forEach((quiz) => {
        if (quiz) {
          // console.log(overdue);
          var isshown = false;
          if (today0 >= quiz.update) {
            isshown = true;
          } else if (arg[0]) {
            isshown = true;
          }
          if (arg[1] && isshown) {
            if (arg[1] === quiz.cat[0]) {
              isshown = true;
            } else {
              isshown = false;
            }
          }
          if (arg[2] && isshown) {
            if (arg[2] === quiz.cat[1]) {
              isshown = true;
            } else {
              isshown = false;
            }
          }
          if (arg[3] && isshown) {
            if (arg[3] === quiz.cat[2]) {
              isshown = true;
            } else {
              isshown = false;
            }
          }
          if (isshown) {
            // console.log(quiz);
            overduearray.push({
              id: quiz.id,
              od: today0 - quiz.update,
              interval: quiz.interval,
              dif: quiz.difficulty,
            });
          }
        }
      });
      const l = overduearray.length;
      console.log(l);
      if (l > 0) {
        overduearray.sort(function (a, b) {
          return b.od - a.od;
        });
        quizcmes = [];
        if (arg.length < 3 && l > 100) {
          overduearray.splice(100);
        }
        getOverdueQuizes(overduearray, event);
      }
    }
  });

  // unloads quizes that are due and changes type[0] to q again
  ipcMain.on("unQuiz", (event, arg) => {
    if (quizcmes.length > 0) {
      const l = quizcmes.length;
      var i;
      for (i = 0; i < l; i++) {
        if (quizcmes[i]) {
          quizcmes[i].types[0] = "q";
          cme.update(quizcmes[i], function (err) {
            if (err) {
              console.log(err); // #error message
            } else {
              console.log(i);
            }
          });
        }
      }
      quizcmes = [];
      var quizres = {
        quizes: quizcmes,
      };
      event.sender.send("loadedQuizes", quizres);
    }
  });

  // answer a quiz and recalculate
  ipcMain.on("answerQuiz", (event, arg) => {
    if (arg["id"]) {
      if (quizes.length === 0) {
        loadQuizes();
      }
      var pos = quizes.findIndex((i) => i.id === arg["id"]);
      if (pos > -1) {
        var pos0 = quizcmes.findIndex((i) => i.id === arg["id"]);
        if (pos0 > -1) {
          var calc = calculate(quizes[pos], arg["scale"], TODAY);
          if (calc) {
            quizes[pos].difficulty = calc.difficulty;
            quizes[pos].interval = calc.interval;
            quizes[pos].update = calc.update;
            if (quizcmes[pos0]) {
              var data = quizcmes[pos0];
              datahistoryController(data, "insert");
              var cmo = JSON.parse(data.cmobject);
              if (cmo["style"]["object"]["str"]) {
                console.log(quizes[pos]);
                cmo["style"]["object"]["str"] = String(calc.interval);
                cmo["style"]["object"]["weight"] = calc.difficulty;
                data.types[0] = "q";
                data.cmobject = JSON.stringify(cmo);
                // saves changes to database
                cme.update(data, function (err) {
                  if (err) {
                    console.log(err); // #error message
                  } else {
                    console.log(data);
                  }
                });
                quizcmes.splice(pos0, 1);
                var quizres = {
                  quizes: quizcmes,
                };
                event.sender.send("loadedQuizes", quizres);
              }
            }
            saveQuizes();
          }
        }
      }
    }
  });

  // deletes CME in Database
  ipcMain.on("delCME", (event, arg) => {
    cme.findOne({ id: arg }, function (err, data) {
      if (err) {
        console.error('Error finding CME to delete:', err);
        event.sender.send("deletedCME", { error: true, message: err.message });
        return;
      }
      if (!data) {
        console.warn('CME to delete not found:', arg);
        event.sender.send("deletedCME", { error: true, message: "CME not found", id: arg });
        return;
      }
      try {
        if (data.types[0] === "q" || data.types[0] === "q1") {
          deleteQuiz(data.id);
        }
        data.state = "del";
        datahistoryController(data, "insert");
        // Remove the CME from the database
        cme.remove({ id: arg }, {}, function (err, numRemoved) {
          if (err) {
            console.error('Error removing CME:', err);
            event.sender.send("deletedCME", { error: true, message: err.message, id: arg });
          } else {
            console.log('CME removed:', arg, 'numRemoved:', numRemoved);
            event.sender.send("deletedCME", { success: true, id: arg, data });
          }
        });
      } catch (e) {
        console.error('Exception during CME deletion:', e);
        event.sender.send("deletedCME", { error: true, message: e.message, id: arg });
      }
    });
  });

  // closes window when mainWindow is closed
  ipcMain.on("WinClosed", () => {
    console.log("WinClosed"), (dbwin = null);
  });
};

// cleans database in defined region dev only
function cleanDB() {
  // gets all elements within a expanded user view. Maybe should be made better
  console.log("cleanDB");
  cme.find(
    {
      $or: [
        {
          $and: [
            { x0: { $gt: -10000, $lt: 2000 } },
            { y0: { $gt: -10000, $lt: 2000 } },
          ],
        },
        {
          $and: [
            { x1: { $gt: -10000, $lt: 2000 } },
            { y1: { $gt: -10000, $lt: 2000 } },
          ],
        },
      ],
    },
    function (err, data) {
      if (err) console.log(err);
      if (data) {
        for (let key in data) {
          if (data[key]) {
            console.log(
              "id: ",
              data[key].id,
              " cmobject: ",
              data[key].cmobject
            );
            data[key].remove(function (err) {});
          }
        }
      }
    }
  );
}

// makes a quiz element
function makeQuiz(id, dif, int, cat0) {
  if (id) {
    if (quizes.length === 0) {
      loadQuizes();
    }
    var cat = [];
    if (cat0) {
      if (cat0.length > 3) {
        cat = cat0.slice(0, 3);
      } else {
        cat = cat0.slice();
        for (var i = 0; i < 3 - cat0.length; i++) {
          cat.push("none");
        }
      }
    }
    if (quizes.findIndex((i) => i.id === id) === -1) {
      var newquiz = {
        id: id,
        cat: cat,
        update: TODAY,
        difficulty: 2.5,
        interval: 1,
      };
      quizes.push(newquiz);
      saveQuizes();
    }
  }
}

// synchronizes quizes with a JSON file element
function syncQuiz() {
  if (true) {
    if (quizes.length === 0) {
      loadQuizes();
    }
    var quizes_old = [];
    console.log("syncQuiz");
    if (fs.existsSync("./data/quizes_old.json")) {
      quizes_old = JSON.parse(fs.readFileSync("./data/quizes_old.json"));
      const l = quizes.length;
      console.log(l);
      var i;
      for (i = 0; i < l; i++) {
        if (quizes[i]) {
          if (quizes[i].id) {
            quizes_old.forEach((quiz) => {
              if (quiz) {
                if (quiz.id === quizes[i].id) {
                  quizes[i].difficulty = quiz.difficulty;
                  quizes[i].interval = quiz.interval;
                  quizes[i].update = quiz.update;
                  console.log(quizes[i]);
                }
              }
            });
          }
        }
      }
      saveQuizes();
    }
  }
}

// changes a quiz element
function changeQuiz(id, dif, int, cat0) {
  console.log(id, dif, int, cat0);
  if (id) {
    if (quizes.length === 0) {
      loadQuizes();
    }
    var cat = [];
    if (cat0) {
      if (cat0.length > 3) {
        cat = cat0.slice(0, 3);
      } else {
        cat = cat0;
      }
    }
    var pos = quizes.findIndex((i) => i.id === id);
    if (pos > -1) {
      quizes[pos].difficulty = Math.max(dif, 1.3);
      quizes[pos].interval = int;
      quizes[pos]["cat"] = cat;
      saveQuizes();
    } else {
      makeQuiz(id, dif, int, cat0);
    }
  }
}

// deletes a quiz element
function deleteQuiz(id) {
  var pos = quizes.findIndex((i) => i.id === id);
  if (pos > -1) {
    quizes.splice(pos, 1);
    saveQuizes();
  }
}

// saves quiz array
function saveQuizes() {
  if (quizes.length > 0) {
    fs.writeFileSync("./data/quizes.json", JSON.stringify(quizes, null, 2));
  }
}

// loads quiz array from json file
function loadQuizes() {
  if (fs.existsSync("./data/quizes.json")) {
    quizes = JSON.parse(fs.readFileSync("./data/quizes.json"));
  }
}

// gets overdue quizzes and sends them to frontend
function getOverdueQuizes(overduearray0, event) {
  if (overduearray0.length === 0) {
    var quizres = {
      catlist: quizcat,
      timelist: quiztime,
      quizes: [],
    };
    if (quizcmes.length === 0) {
      console.log(
        "No quizes ar due now, another click will load quizes due later."
      );
      quizclick = 1;
    } else {
      quizclick = 0;
    }
    event.sender.send("loadedQuizes", quizres);
    quizbool = true;
  } else {
    // console.log('before shift: ', overduearray0);
    const overduequiz = overduearray0.shift();
    if (overduequiz) {
      // console.log('before find: ', overduequiz.id);
      cme.findOne({ id: overduequiz.id }, function (err, data0) {
        if (err) console.log(err);
        var data = data0;
        // console.log('data0: ', data0);
        if (data && overduequiz) {
          data.types[0] = "q1";
          var cmo = JSON.parse(data.cmobject);
          if (cmo["style"]["object"]["str"]) {
            cmo["style"]["object"]["str"] = String(overduequiz.interval);
            cmo["style"]["object"]["weight"] = overduequiz.dif;
            data.cmobject = JSON.stringify(cmo);
            quizcmes.push(data);
            // console.log('data id: ', data.id);
            cme.update(data, function (err) {
              if (err) {
                console.log(err); // #error message
              } else {
                if (overduearray0.length === 0) {
                  event.sender.send("changedCME", quizcmes);
                  var quizres = {
                    catlist: quizcat,
                    timelist: quiztime,
                    quizes: quizcmes,
                  };
                  // console.log('quizes send');
                  event.sender.send("loadedQuizes", quizres);
                  quizbool = true;
                } else {
                  getOverdueQuizes(overduearray0, event);
                }
              }
            });
          }
        } else {
          console.log("something wrong with: ", overduequiz);
          getOverdueQuizes(overduearray0, event);
        }
      });
    }
  }
}

// gets all elements with same category
function getByCat(cat0) {
  console.log(cat0);
  cme.find(
    {
      cat: {
        $elemMatch: cat0,
      },
    },
    function (err, data) {
      if (err) {
        console.log(err);
        return [];
      } else {
        console.log(data);
        return data;
      }
    }
  );
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
        data[i].cat = data[i].cat.splice(catpos, 1, title1);
        console.log(data[i].cat);
        cme.update(data[i], function (err) {
          if (err) {
            console.log(err); // #error message
          } else {
            console.log(i);
          }
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
      setTimeout(function () {
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
      if (Date.now() - endcounter >= 100) {
        // console.info(cmeArray);
        event.sender.send("changedCME", cmeArray);
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
      if (typeof cme0.id === "number") {
        if (cme0.id >= 1) {
          if (selCMEoArray.indexOf(cme0.id) === -1) {
            var iscat = false;
            for (var i = 0; i < catl; i++) {
              if (arg.cat[i] && cme0.cat[i]) {
                if (arg.cat[i] === cme0.cat[i] || title0 === cme0.cat[i]) {
                  iscat = true;
                } else {
                  iscat = false;
                }
              } else {
                iscat = false;
              }
            }
            if (iscat) {
              var catpos = cme0.cat.indexOf(title0);
              if (catpos > -1) {
                cme0.cat[catpos] = title1;
                cme.update(cme0, function (err) {
                  if (err) {
                    console.log(err); // #error message
                  } else {
                    console.log(cme0);
                  }
                });
                cmeArray.push(cme0);
                var cmobject;
                if (typeof cme0.cmobject === "string") {
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
                          cme.findOne(
                            { id: link.targetId },
                            function (err, data) {
                              if (err) {
                                console.log(err);
                              } else {
                                if (data) {
                                  selectLinks(data);
                                } else {
                                  console.log(
                                    "Error (Child) at ParentID: ",
                                    cme0.id,
                                    " ChildId: ",
                                    link.targetId,
                                    " LinkId: ",
                                    link.id
                                  );
                                }
                              }
                            }
                          );
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
  if (ident === "insert") {
    if (datahistory.length <= 1000) {
      datahistory.push(data);
    } else {
      datahistory.shift();
      datahistory.push(data);
    }
  } else if (ident === "retrieve") {
    return datahistory.pop();
  }
}

module.exports = createDbWindow;
