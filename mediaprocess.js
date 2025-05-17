const { BrowserWindow, clipboard, ipcMain, nativeImage, session, shell } = require('electron');
const fs = require('fs');
const exec = require('child_process').exec;
// const getPixels = require("get-pixels")
const PNG = require('pngjs').PNG;
const mjAPI = require("mathjax-node");
// Initialize @electron/remote
const remoteMain = require("@electron/remote/main");

let mediawin

// ---------------------------------------------
// creates background window for Media handling
// ---------------------------------------------

const createMediaWindow = function createMediaWindow () {
  console.log('Media Window');
  // Create the browser window.
  mediawin = new BrowserWindow({
    width: 1, 
    height: 1, 
    show: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    }
  })
  
  // Enable remote module for this window
  remoteMain.enable(mediawin.webContents);

  // Emitted when the window is closed.
  mediawin.on('closed', () => {
    mediawin = null
  });

  // opens url in os' default browser
  ipcMain.on('openBrowser', (event, arg) => {
    if (arg) {
      if (arg['type'] && arg['path']) {
        switch (arg.type) {
          case 'pdf':
            var path;
            if (arg.complete) {
              if (arg.path.indexOf(__dirname) !== -1) {
                path = 'file://' + arg.path;
              } else {
                var cognimappos = arg.path.indexOf('/cognimap');
                if (cognimappos > -1) {
                  var pathstring = arg.path.slice(cognimappos + 9);
                  path = 'file://' + __dirname + pathstring;
                }
              }
            } else {
              path = 'file://' + __dirname + arg.path;
            }
            shell.openExternal(path);
            event.returnValue = 'Opened PDF: ' + path;
            break;
          case 'txt':
            var path;
            if (arg.complete) {
              if (arg.path.indexOf(__dirname) !== -1) {
                path = arg.path;
              } else {
                var cognimappos = arg.path.indexOf('/cognimap');
                if (cognimappos > -1) {
                  var pathstring = arg.path.slice(cognimappos + 9);
                  path = 'file://' + __dirname + pathstring;
                }
              }
            } else {
              path = 'file://' + __dirname + arg.path;
            }
            shell.openExternal(path);
            event.returnValue = 'Opened txt: ' + path;
            break;
          case 'link':
            shell.openExternal(arg.path);
            event.returnValue = 'Opened site: ' + arg.path;
            break;
          case 'audio':
          case 'videos':
            var path;
            if (arg.complete) {
              if (arg.path.indexOf(__dirname) !== -1) {
                path = 'vlc ' + arg.path;
              } else {
                var cognimappos = arg.path.indexOf('/cognimap');
                if (cognimappos > -1) {
                  var pathstring = arg.path.slice(cognimappos + 9);
                  path = 'vlc' + __dirname + pathstring;
                }
              }
            } else {
              path = 'vlc ' + __dirname + arg.path;
            }
            function execute(command, callback){
                exec(command, function(error, stdout, stderr){ callback(stdout); });
            };
            // call the function
            execute(path, function(output) {
                console.log(output);
            });
            event.returnValue = 'Opened video: ' + path;
            break;
          case 'picture':
            var path;
            if (arg.complete) {
              if (arg.path.indexOf(__dirname) !== -1) {
                path = arg.path;
              } else {
                var cognimappos = arg.path.indexOf('/cognimap');
                if (cognimappos > -1) {
                  var pathstring = arg.path.slice(cognimappos + 9);
                  path = __dirname + pathstring;
                }
              }
            } else {
              path = __dirname + arg.path;
            }
            // copies the file with an 'e' on the name for edit and to avoid cache conflicts
            var pngbuffer = fs.readFileSync(path);
            if (pngbuffer) {
              var newfilepath = path.replace('.png', 'e.png');
              fs.writeFileSync(newfilepath, pngbuffer);
              console.log(path);
              newfilepath = 'kolourpaint ' + newfilepath;
              function execute(command, callback){
                  exec(command, function(error, stdout, stderr){ callback(stdout); });
              };
              // call the function
              execute(newfilepath, function(output) {
                  console.log(output);
              });
              event.returnValue = path.replace('.png', 'e.png');
            } else {
              event.returnValue = 'Can not open picture: ' + path;
            }
            break;
          default:
            event.returnValue = 'Can not open: ' + arg.path + 'unknown type' + arg.type;
        }
      } else {
        event.returnValue = 'error: ' + JSON.stringify(arg);
      }
    }
  })

  // reads files in assets
  ipcMain.on('readAssetFiles', (event, arg) => {
    var filearray = [];
    function iterateDirectories(folders) {
      if (folders) {
        if (folders.length > 0) {
          for (var i = 0; i < folders.length; i++) {
            var folder = {
              name: folders[i].name,
              files: [],
              folders: []
            };
            var dir = fs.readdirSync(folders[i].path);
            if (dir) {
              for (var j = 0; j < dir.length; j++) {
                if (dir[j]) {
                  var elementpath = folders[i].path + '/' + dir[j];
                  var stats = fs.statSync(elementpath);
                  if (stats.isDirectory()) {
                    if (dir[j].indexOf(' ') !== -1) {
                      dir[j] = '"' + dir[j] + '"';
                    }
                    folder.folders.push({
                      name: dir[j],
                      path: elementpath
                    })
                  } else if (stats.isFile()) {
                    if (dir[j].indexOf(' ') !== -1) {
                      dir[j] = '"' + dir[j];
                      if (dir[j].indexOf('.') !== -1) {
                        dir[j] = dir[j].replace('.', '".');
                      } else {
                        dir[j] += '"';
                      }
                    }
                    folder.files.push({
                      name: dir[j],
                      path: elementpath
                    })
                  }
                }
              }
              filearray.push(folder);
              if (folder.folders.length > 0) {
                iterateDirectories(folder.folders)
              }
            }
          }
        }
      }
    }
    if (arg['prefix'] && arg['folders']) {
      if (arg.folders.length > 0) {
        var startarray = [];
        for (var i = 0; i < arg.folders.length; i++) {
          var path = __dirname + arg.prefix + 'assets/' + arg.folders[i];
          console.log(path);
          startarray.push({
            name: arg.folders[i],
            path: path
          })
        }
        iterateDirectories(startarray)
        event.returnValue = filearray;
      }
    }
  })

  // makes a SVG from mathjax/TeX string
  ipcMain.on('makeMjSVG', (event, arg) => {
    mjAPI.config({
      MathJax: {
        SVG: {
          scale: 150
        }
      }
    });
    // console.log('TeX: ', arg);
    var svg = mjAPI.typeset({
      math: arg,
      format: "TeX", // "inline-TeX", "MathML"
      svg:true, //  svg:true,
    }, function (data) {
      if (data.errors) {
        // console.log(data.errors);
        event.returnValue = 'error';
      } else {
        event.returnValue = data;
      }
    });
  })

  // makes a picture transparent
  ipcMain.on('makeTrans', (event, arg) => {
    console.log('makeTrans: ', arg);
    if (arg.file) {
      if (arg.color) {
        const filepath = './dist/assets/images/' + arg.file;
        var pngbuffer = fs.readFileSync(filepath);
        var png = PNG.sync.read(pngbuffer);
        var num = 255;
        if (arg.color === 'black') {
          num = 0;
        }
        if (arg.tolerance) {
          num = Math.abs(num - arg.tolerance)
        }
        // var linearray0 = [];
        // var linearray1 = [];
        const nx = png.width;
        const ny = png.height;
        for (var y = 0; y < ny; y++) {
          // var line0 = '';
          // var line1 = '';
          for (var x = 0; x < nx; x++) {
            var idx = (nx * y * 4 + x * 4);
            // line0 += '(R:' + png.data[idx] + 'G:' + png.data[idx+1] + 'B:' + png.data[idx+2] + 'T:' + png.data[idx+3] + ')';
            if (arg.color === 'black') {
              if (png.data[idx] <= num && png.data[idx+1] <= num && png.data[idx+2] <= num) {
                png.data[idx+3] = 0;
                // line1 += '(R:' + png.data[idx] + 'G:' + png.data[idx+1] + 'B:' + png.data[idx+2] + 'T:' + png.data[idx+3] + ')';
              } else {
                // line1 += '(R:' + png.data[idx] + 'G:' + png.data[idx+1] + 'B:' + png.data[idx+2] + 'T:' + png.data[idx+3] + ')';
              }
            } else {
              if (png.data[idx] >= num && png.data[idx+1] >= num && png.data[idx+2] >= num) {
                png.data[idx+3] = 0;
                // line1 += '(R:' + png.data[idx] + 'G:' + png.data[idx+1] + 'B:' + png.data[idx+2] + 'T:' + png.data[idx+3] + ')';
              } else {
                // line1 += '(R:' + png.data[idx] + 'G:' + png.data[idx+1] + 'B:' + png.data[idx+2] + 'T:' + png.data[idx+3] + ')';
              }
            }
          }
          // linearray0.push(line0);
          // linearray1.push(line1);
        }
        var newpngbuffer = PNG.sync.write(png);
        var newfilepath;
        var newfile;
        if (filepath.indexOf('.png') !== -1) {
          newfilepath = filepath.replace('.png', 't.png');
          newfile = arg.file.replace('.png', 't.png');
        } else if (filepath.indexOf('.PNG') !== -1) {
          newfilepath = filepath.replace('.PNG', 't.png');
          newfile = arg.file.replace('.PNG', 't.png');
        }
        if (newfilepath && newfile) {
          fs.writeFileSync(newfilepath, newpngbuffer);
          console.log(newfilepath);
          event.returnValue = newfile;
        } else {
          event.returnValue = arg.file;
        }
      }
    }
  })

  // makes a picture transparent
  ipcMain.on('makeTransBulk', (event, arg) => {
    console.log('makeTransBulk: ', arg);
    var filelist = fs.readdirSync('/home/pmk/cognimap/dist/mnemo/raw');
    for (var i = 1; i < filelist.length; i++) {
      if (filelist[i]) {
        const filepath = '/home/pmk/cognimap/dist/mnemo/raw/' + filelist[i];
        var pngbuffer = fs.readFileSync(filepath);
        var png = PNG.sync.read(pngbuffer);
        var num = 255;
        if (arg.color === 'black') {
          num = 0;
        }
        if (arg.tolerance) {
          num = Math.abs(num - arg.tolerance)
        }
        // var linearray0 = [];
        // var linearray1 = [];
        const nx = png.width;
        const ny = png.height;
        for (var y = 0; y < ny; y++) {
          // var line0 = '';
          // var line1 = '';
          for (var x = 0; x < nx; x++) {
            var idx = (nx * y * 4 + x * 4);
            // line0 += '(R:' + png.data[idx] + 'G:' + png.data[idx+1] + 'B:' + png.data[idx+2] + 'T:' + png.data[idx+3] + ')';
            if (arg.color === 'black') {
              if (png.data[idx] <= num && png.data[idx+1] <= num && png.data[idx+2] <= num) {
                png.data[idx+3] = 0;
                // line1 += '(R:' + png.data[idx] + 'G:' + png.data[idx+1] + 'B:' + png.data[idx+2] + 'T:' + png.data[idx+3] + ')';
              } else {
                // line1 += '(R:' + png.data[idx] + 'G:' + png.data[idx+1] + 'B:' + png.data[idx+2] + 'T:' + png.data[idx+3] + ')';
              }
            } else {
              if (png.data[idx] >= num && png.data[idx+1] >= num && png.data[idx+2] >= num) {
                png.data[idx+3] = 0;
                // line1 += '(R:' + png.data[idx] + 'G:' + png.data[idx+1] + 'B:' + png.data[idx+2] + 'T:' + png.data[idx+3] + ')';
              } else {
                // line1 += '(R:' + png.data[idx] + 'G:' + png.data[idx+1] + 'B:' + png.data[idx+2] + 'T:' + png.data[idx+3] + ')';
              }
            }
          }
          // linearray0.push(line0);
          // linearray1.push(line1);
        }
        var newpngbuffer = PNG.sync.write(png);
        var newfilepath = filepath.replace('raw', 'trans');
        fs.writeFileSync(newfilepath, newpngbuffer);
        console.log(newfilepath);
      }
    }
    event.returnValue = 'success';
  })

  // load file from assets folder
  ipcMain.on('loadFile', function (event, arg) {
    if (fs.statSync(arg)) {
      var pos = arg.indexOf('assets/');
      if (pos !== -1) {
        var path = arg.slice(pos);
        event.returnValue = path;
      } else {
        event.returnValue = 'please choose a file insite your /assets/!';
      }
    }
  })

  // get clipboard content and handles it
  ipcMain.on('getClipboard', (event, arg) => {
    var type = clipboard.availableFormats();
    if (type.indexOf('image/png') !== -1) {
      var nimg = clipboard.readImage().toPNG();
      var picture_link = 'cm/pmk_' + Date.now().toString() + '.png';
      fs.writeFileSync(('./dist/assets/images/' + picture_link), nimg);
      try {
        fs.writeFileSync(('./src/assets/images/' + picture_link), nimg);
      } catch (err) {
        console.log(err);
      }
      const action = {
        type: 'png',
        payload: picture_link,
        info: 'png'
      }
      event.returnValue = action;
    } else if (type.indexOf('text/html') !== -1) {
      var html = clipboard.readHTML();
      console.log('text/html', html);
      const action = {
        type: 'html',
        payload: html,
        info: 'html'
      }
      event.returnValue = action;
    } else if (type.indexOf('text/plain') !== -1) {
      var text = clipboard.readText();
      var action;
      try {
        var input = JSON.parse(text);
        action = {
          type: input.type,
          payload: input.object,
          info: input.info
        }
      } catch (err) {
        action = {
          type: 'text',
          payload: text,
          info: err
        }
      }
      // console.log(action);
      event.returnValue = action;
    } else {
      console.log('no readable content');
      const action = {
        type: 'empty',
        payload: ''
      }
      event.returnValue = '';
    }
  })

  // closes window when mainWindow is closed
  ipcMain.on('WinClosed', () => {
    console.log('WinClosed'),
    dbwin = null
  });
}

module.exports = createMediaWindow;

/*
for (var i = 0; i < 100000; i++) {
    	if (i % 17 === 0) {
        	var i_str = i.toString();
            if (i_str.slice(-2) === '17') {
            	var i_array = i_str.split('');
                var i_sum = 0;
                for (var j = 0; j < i_array.length; j++) {
                	i_sum += parseInt(i_array[j]);
                }
                document.getElementById("demo").innerHTML = i_str.slice(-2);
                if (i_sum === 17) {
                	document.getElementById("demo").innerHTML = i;
                    break;
                }
            }
        }
    }
    */
