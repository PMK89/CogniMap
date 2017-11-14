'use strict';

const {app, BrowserWindow, ipcMain, session, Menu} = require('electron')
const path = require('path')
const fs = require('fs')
const url = require('url')

let win

const settingscontroller = require('./settingsController');
const createDbWindow = require('./dbprocess');
const createMediaWindow = require('./mediaprocess');
const menu = require('./menu');


// ----------------------------
// creates main Window with GUI
// ----------------------------


function createWindow () {
  console.log('GUI Window');
  // Create the browser window.
  win = new BrowserWindow({width: 1800, height: 1000, show: true})

  // and load the index.html of the app.
  // const pathname = 'file://' + path.join(__dirname, 'dist/index.html');
  win.loadURL(url.format({
    pathname: '//localhost:3000/index.html',
    protocol: 'http:',
    slashes: true
  }))

  // Modify the user agent for all requests to the following urls.
  const filter = {
    urls: ['//localhost:3000/assets/images/*']
  }

  session.defaultSession.webRequest.onBeforeRequest(filter, (details, callback) => {
    console.log(details)
    callback({cancel: false, })
  })

  // Open the DevTools.
  // win.webContents.openDevTools()

  // Emitted when the window is closed.
  win.on('closed', () => {
    win = null
  });
}


// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  createWindow(),
  createDbWindow(),
  createMediaWindow(),
  console.log(process.versions.electron)
})

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  event.sender.send('WinClosed');
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow(),
    createDbWindow(),
    createMediaWindow()
  }
})
