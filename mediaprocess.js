const { BrowserWindow, clipboard, ipcMain, nativeImage, session } = require('electron');
const fs = require('fs');
// const getPixels = require("get-pixels")
const PNG = require('pngjs').PNG;

let mediawin

// ---------------------------------------------
// creates background window for Media handling
// ---------------------------------------------

const createMediaWindow = function createMediaWindow () {
  console.log('Media Window');
  // Create the browser window.
  mediawin = new BrowserWindow({width: 1, height: 1, show: false})

  // Emitted when the window is closed.
  mediawin.on('closed', () => {
    mediawin = null
  });

  // get clipboard content if its a picture
  ipcMain.on('getPicture', (event, arg) => {
    // console.log('Parameters: ', arg);
    var nimg = clipboard.readImage().toPNG();
    var picture_link = 'chem/oc/' + Date.now().toString() + '.png';
    fs.writeFileSync(('./dist/assets/images/' + picture_link), nimg);

    event.returnValue = picture_link;
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
        // console.log(png);
        if (arg.color === 'black') {
          num = 0;
        }
        const nx = png.width;
        const ny = png.height;
        for (var y = 0; y < ny; y++) {
          for (var x = 0; x < nx; x++) {
            var idx = (nx * y + x);
            if (png.data[idx] === num && png.data[idx+1] === num && png.data[idx+2] === num) {
              png.data[idx+3] = 0;
            }

          }
        }
        // console.log(png);
        pngbuffer = PNG.sync.write(png);
        fs.writeFileSync(filepath, pngbuffer);
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
      const action = {
        type: 'png',
        payload: picture_link
      }
      event.returnValue = action;
    } else if (type.indexOf('text/html') !== -1) {
      var html = clipboard.readHTML();
      const action = {
        type: 'html',
        payload: html
      }
      event.returnValue = action;
    } else if (type.indexOf('text/plain') !== -1) {
      var text = clipboard.readText();
      const action = {
        type: 'text',
        payload: text
      }
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
