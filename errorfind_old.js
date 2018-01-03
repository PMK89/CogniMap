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
        var error = false;
        if(data[i]) {
          if (data[i].id) {
            try {
              if ([data[i].x0, data[i].x1, data[i].y0, data[i].y1].indexOf(NaN) !== -1) {
                console.log('NaN: ', data[i].id);
                dataArray.push(data[i]);
                data[i].remove(function (err) {console.log('NaN: ', err)});
              } else if ([data[i].x0, data[i].x1, data[i].y0, data[i].y1].indexOf(undefined) !== -1) {
                console.log('undefined: ', data[i].id);
                dataArray.push(data[i]);
                data[i].remove(function (err) {console.log('undefined: ', err)});
              } else if (data[i].x0 < 0 || data[i].x1 < 0 || data[i].y0 < 0 || data[i].y1 < 0) {
                console.log('<0: ', data[i].id);
                dataArray.push(data[i]);
                data[i].remove(function (err) {console.log('<0: ', err)});
              }
              /*
              var cmobject = JSON.parse(data[i].cmobject);
              if (cmobject.links) {
                if (cmobject.links.length > 0) {
                  for (var j = cmobject.links.length - 1; j >= 0; j--) {
                    if (cmobject.links[j]) {
                      if (typeof cmobject.links[j].id === 'number' && typeof cmobject.links[j].targetId === 'number') {
                        var linkid0 = (-1) * parseInt(String(data[i].id) + String(cmobject.links[j].targetId), 10);
                        var linkid1 = (-1) * parseInt(String(cmobject.links[j].targetId) + String(data[i].id), 10);
                        if (cmobject.links[j].id === 0) {
                          if (cmobject.links[j].title === 'marking') {
                            // console.log('marking: ', cmobject.links[j]);
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
                        var linkCME = linkCMEarray.pop();
                        if (!linkCME) {
                          if (cmobject.links[j].id !== 0) {
                            error = true;
                            console.log('delete: ', cmobject.links[j]);
                            cmobject.links.splice(j, 1);
                          } else {
                            // console.log('no delete: ', cmobject.links[j]);
                          }
                        }
                      } else {
                        error = true;
                        console.log('delete: ', cmobject.links[j]);
                        cmobject.links.splice(j, 1);
                        console.log('non numeric id: ', data[i].id);
                      }
                    }
                  }
                } else {
                  dataArray.push(data[i]);
                }
              }
              if (error) {
                dataArray.push(data[i]);
                data[i].cmobject = JSON.stringify(cmobject);
                data[i].save(function (err) {
                  if (err) {
                    console.log(err) // #error message
                  }
                });
              }
              */
            } catch (err) {
              console.log(err)
            }
          }
        }
      }
      fs.writeFileSync('./data/newdb.json', JSON.stringify(data, null, 2));
      event.returnValue = 'changed elements ' + JSON.stringify(dataArray, null, 2);
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

  function iterate(id, parentarray, catarray0, parent) {
    try {
      var catarray = catarray0;
      const pos = data_array.findIndex(i => i.id === id);
      if (pos > -1) {
        var cme = data_array[pos];
        if (cme.cat.length > 0) {
          catarray = cme.cat;
        } else {
          cme.cat = catarray;
          if (cme.cat.length < 1) {
            cme.cat.push(cme.title);
          }
        }
        data_array[pos] = cme;
        const linkpos = Number(cme.state);
        const cmobject = chng_array[pos];
        console.log(id, linkpos, parentarray, catarray);
        if (linkpos > 0) {
          var link = cmobject.links[linkpos - 1];
          if (link.weight !== 0) {
            var state = String(linkpos - 1);
            if (typeof Number(state) === 'number') {
              cme.state = state;
            } else {
              console.log(state);
              logstr += 'Undefined shit ID: ' + id + 'linkpos: ' + linkpos + ' Error: unexpected state \n';
            }
            data_array[pos] = cme;
            if (link.targetId > 1 && parentarray.indexOf(link.targetId) === -1 && link.start) {
              var newparentarray = [];
              var newcatarray = [];
              if (parentarray.indexOf(cme.id) === -1) {
                newparentarray = parentarray.concat([cme.id]);
              }
              if (catarray.length <= 7 && catarray.indexOf(cme.title) === -1 && cme.title !== '' && cme.title !== ' ') {
                newcatarray = catarray.concat([cme.title]);
              }
              if (newparentarray.length > 0) {
                if (newcatarray.length > 0) {
                  iterate(link.targetId, newparentarray, newcatarray, parent);
                } else {
                  iterate(link.targetId, newparentarray, catarray, parent);
                }
              } else {
                if (newcatarray.length > 0) {
                  iterate(link.targetId, parentarray, newcatarray, parent);
                } else {
                  iterate(link.targetId, parentarray, catarray, parent);
                }
              }
            } else {
              iterate(id, parentarray, catarray, parent);
            }
          } else {
            var state = String(linkpos - 1);
            if (typeof Number(state) === 'number') {
              cme.state = state;
            } else {
              console.log(state);
              logstr += 'Undefined shit ID: ' + id + 'linkpos: ' + linkpos + ' Error: unexpected state \n';
            }
            data_array[pos] = cme;
            iterate(id, parentarray, catarray, parent);
          }
        } else {
          if (cme.state === '0' || cme.state === 0) {
            cme.state = '';
            data_array[pos] = cme;
            if (parentarray.length > 0) {
              var oldid = parentarray.pop();
              if (oldid === parent) {
                return parentarray, catarray, parent;
              } else {
                if (oldid) {
                  iterate(oldid, parentarray, catarray, parent);
                } else {
                  return;
                }
              }
            } else {
              return;
            }
          } else {
            logstr += 'ID: ' + id + ' parentarray: ' + parentarray + 'catarray: ' + catarray + ' Error: unexpected state: ' + cme.state + '\n';
            if (parentarray.length > 0) {
              var oldid = parentarray.pop();
              if (oldid === parent) {
                return parentarray, catarray, parent;
              } else {
                if (oldid) {
                  iterate(oldid, parentarray, catarray, parent);
                } else {
                  return;
                }
              }
            } else {
              return;
            }
          }
        }
      } else {
        logstr += 'ID: ' + id + 'parentarray: ' + parentarray + 'catarray: ' + catarray + ' Error: ID not found \n';
        if (parentarray.length > 0) {
          var oldid = parentarray.pop();
          if (oldid === parent) {
            return parentarray, catarray, parent;
          } else {
            if (oldid) {
              iterate(oldid, parentarray, catarray, parent);
            } else {
              return;
            }
          }
        } else {
          return;
        }
      }
    } catch (err) {
      logstr += 'Error: ' + err + 'parent: ' + parent + ' \n';
      iterateParent(parent);
    }

  }

  // iterates through the cognimap object
  function iterateParent(parent) {
    const pos = data_array.findIndex(i => i.id === parent);
    if (pos > -1) {
      var cmobject = chng_array[pos];
      data_array[pos].cat.push(data_array[pos].title)
      if (cmobject.links) {
        if (cmobject.links.length > 0) {
          var i;
          const l = cmobject.links.length;
          for (i = 0; i < l; i++) {
            if (cmobject.links[i]) {
              if (cmobject.links[i].targetId !== 1 && cmobject.links[i].weight !== 0 && cmobject.links[i].start) {
                var link = cmobject.links[i];
                console.log(link.targetId);
                iterate(link.targetId, [1, parent], [data_array[pos].title], parent);
              }
            }
          }
        }
      }
    }
  }

  // iterates through the cognimap object
  function iterateCogniMap() {
    const pos = data_array.findIndex(i => i.id === 1);
    if (pos > -1) {
      var cmobject = chng_array[pos];
      if (cmobject.links) {
        if (cmobject.links.length > 0) {
          var i;
          const l = cmobject.links.length;
          for (i = 0; i < l; i++) {
            if (cmobject.links[i]) {
              var link = cmobject.links[i];
              console.log(link.targetId);
              iterateParent(link.targetId);
            }
          }
        }
      }
    }
  }

  // saves data back to db
  function saveData() {
    if (data_array.length > 0) {
      var i;
      const l = data_array.length;
      for (i = 0; i < l; i++) {
        if (data_array[i]) {
          var cme = data_array[i];
          try {
            cme.cmobject = JSON.stringify(chng_array[i]);
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
      var strData = JSON.stringify(data_array, null, 2);
      fs.writeFileSync('./data/cmdbnew.json', strData);
    }
  }

  function makeCat() {
    logstr += 'Categorizing Error-Log\n\n';
    logstr += 'Errors while parsing DB-Data\n';
    unpackData();
    logstr += 'Errors while iterating\n';
    iterateCogniMap();
    logstr += 'Errors while saving DB\n';
    saveData();
    fs.writeFileSync('./data/catlog.txt', logstr);
    event.returnValue = 'changed elements ';
  }

  cme.find({id: { $gte: 1}}, function(err, data) {
    if (err) console.log(err);
    if (data) {
        data_array = data;
        makeCat();
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
      var baddataarray = [];
      var removeddata = [];
      var repaireddata = [];
      var i0;
      const l = data_array.length;
      for (i0 = 0; i0 < l; i0++) {
        if (data_array[i0]) {
          if (data_array[i0].cat.length < 1 && data_array[i0].id !== 1) {
            var cmobject = JSON.parse(data_array[i0].cmobject);
            var baddata = {
              id: data_array[i0].id,
              title: data_array[i0].title,
              cat: data_array[i0].cat,
              object: cmobject.links
            };
            if (cmobject.links.length < 1) {
              removeddata.push(baddata);
            } else {
              var isbad = true
              var j;
              const l1 = cmobject.links.length;
              for (j = 0; j < l1; j++) {
                if(cmobject.links[j]) {
                  if(!cmobject.links[j].start) {
                    if (cmobject.links[j].targetId) {
                      const pos = data_array.findIndex(i => i.id === cmobject.links[j].targetId);
                      if (pos > -1) {
                        if (data_array[pos]) {
                          var parent = data_array[pos];
                          var pcmobject = JSON.parse(data_array[pos].cmobject);
                          data_array[i0].cat = parent.cat;
                          var pcng = false;
                          var k;
                          const l2 = pcmobject.links.length;
                          for (k = 0; k < l2; k++) {
                            if(pcmobject.links[k]) {
                              if (pcmobject.links[k].targetId === data_array[i0].id) {
                                pcmobject.links[k].id = (-1) * parseInt(String(parent.id) + String(data_array[i0].id), 10);
                                pcmobject.links[k].start = true;
                                pcmobject.links[k].title = data_array[i0].title;
                                if (Math.abs(data_array[i0].coor.x - parent.coor.x) < 3000 && Math.abs(data_array[i0].coor.y - parent.coor.y) < 3000) {
                                  pcmobject.links[k].weight = -1;
                                }
                                data_array[pos].cmobject = JSON.stringify(pcmobject);
                                isbad = false;
                                repaireddata.push(baddata);
                              } else if (pcmobject.links[k].id === (-1) * parseInt(String(parent.id) + String(data_array[i0].id), 10)) {
                                isbad = false;
                                repaireddata.push(baddata);
                              } else {
                                if (isbad && k === l2 - 1) {
                                  if (Math.abs(data_array[i0].coor.x - parent.coor.x) < 3000 && Math.abs(data_array[i0].coor.y - parent.coor.y) < 3000) {
                                    isbad = false;
                                    repaireddata.push(baddata);
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
              }
              if (isbad) {
                baddataarray.push(baddata);
              }
            }
          }
        }
      }
      for (i = 0; i < l; i++) {
        if (data_array[i]) {
          data_array[i].save(function (err) {
            if (err) {
              console.log(err) // #error message
            }
          });
        }
      }
      for (i = 0; i < removeddata.length; i++) {
        if (removeddata[i]) {
          cme.findOne({id: removeddata[i].id}, function(err, data) {
            if (err) console.log(err);
            if (data) {
              data.remove(function (err) {
              });
            }
          });
        }
      }
      var strData = 'Removed elements ' + removeddata.length + '\n';
      strData += JSON.stringify(removeddata, null, 2);
      strData += '\n\n\n\n\n\n\n\n Repaired elements ' + repaireddata.length + '\n\n\n\n\n\n\n\n\n ';
      strData += JSON.stringify(repaireddata, null, 2);
      strData += '\n\n\n\n\n\n\n\n Bad elements ' + baddataarray.length + '\n\n\n\n\n\n\n';
      strData += JSON.stringify(baddataarray, null, 2);
      fs.writeFileSync('./data/baddata.json', strData);
      event.returnValue = 'Removed Elements: ' + removeddata.length +
      ' Repaired Elements: ' + repaireddata.length + ' Bad Elements: '
      + baddataarray.length;
    }
  }

  cme.find({id: { $gte: 1}}).sort({ id: 1 }).exec(function(err, data) {
    if (err) console.log(err);
    if (data) {
        data_array = data;
        unpackData();
    }
  });

})
