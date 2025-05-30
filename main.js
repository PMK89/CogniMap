"use strict";

const { app, BrowserWindow, ipcMain, session, Menu } = require("electron");
const path = require("path");
const fs = require("fs");
const url = require("url");
// Initialize @electron/remote
const remoteMain = require("@electron/remote/main");
remoteMain.initialize();

// Disable GPU acceleration to fix libva error
app.disableHardwareAcceleration();

// Comment out DevTools disabling to debug loading issue
// app.commandLine.appendSwitch('disable-devtools');

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.log('Unhandled Rejection at:', promise, 'reason:', reason);
  // Application specific logging, throwing an error, or other logic here
});

let win;

const settingscontroller = require("./settingsController");
const createDbWindow = require("./dbprocess");
const createMediaWindow = require("./mediaprocess");
const menu = require("./menu");

// ----------------------------
// creates main Window with GUI
// ----------------------------

function createWindow() {
  console.log("GUI Window");
  // Create the browser window.
  win = new BrowserWindow({
    width: 1800,
    height: 1000,
    show: true,
    webPreferences: {
      nodeIntegration: true, // Enable Node integration
      contextIsolation: false, // Disable context isolation
      enableRemoteModule: true, // Enable remote module
    },
  });
  
  // Enable remote module for this window
  remoteMain.enable(win.webContents);

  // and load the index.html of the app.
  ///*
  const pathname = path.join(__dirname, "dist/index.html");
  win.loadURL(
    url.format({
      pathname: pathname,
      protocol: "file",
      slashes: true,
    })
  );
  //*/

  /*
  win.loadURL(url.format({
    pathname: '//localhost:3000/index.html',
    protocol: 'http:',
    slashes: true
  }))
  */

  // Modify the user agent for all requests to the following urls.
  const filter = {
    urls: ["//localhost:3000/assets/images/*"],
  };

  session.defaultSession.webRequest.onBeforeRequest(
    filter,
    (details, callback) => {
      console.log(details);
      callback({ cancel: false });
    }
  );

  // Enable DevTools to debug loading issue
  win.webContents.openDevTools({ mode: 'detach' });
  
  // Add event listeners for debugging
  win.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('Failed to load:', errorCode, errorDescription);
  });
  
  win.webContents.on('did-finish-load', () => {
    console.log('Page finished loading');
  });
  
  win.webContents.on('dom-ready', () => {
    console.log('DOM ready');
  });
  
  win.webContents.on('console-message', (event, level, message, line, sourceId) => {
    console.log('Console message:', message);
  });

  // Emitted when the window is closed.
  win.on("closed", () => {
    win = null;
  });
}

// ----------------------------
// creates Widget Window with GUI
// ----------------------------

function createWidgetWindow(urlpath, width, height) {
  console.log("GUI Window");
  // Create the browser window.
  win = new BrowserWindow({ 
    width: width, 
    height: height, 
    show: true,
    webPreferences: {
      nodeIntegration: true, // Enable Node integration
      contextIsolation: false, // Disable context isolation
      enableRemoteModule: true, // Enable remote module
    }
  });
  
  // Enable remote module for this window
  remoteMain.enable(win.webContents);

  // and load the index.html of the app.
  // const pathname = 'file://' + path.join(__dirname, 'dist/index.html');
  win.loadURL(
    url.format({
      pathname: urlpath,
      protocol: "http:",
      slashes: true,
    })
  );

  // Modify the user agent for all requests to the following urls.
  const filter = {
    urls: ["//localhost:3000/assets/images/*"],
  };

  // Disable DevTools to avoid "Failed to fetch" error
  // win.webContents.openDevTools();

  session.defaultSession.webRequest.onBeforeRequest(
    filter,
    (details, callback) => {
      console.log(details);
      callback({ cancel: false });
    }
  );

  // Emitted when the window is closed.
  win.on("closed", () => {
    win = null;
  });
}

// opens Widget in new Window
ipcMain.on("openWidget", (event, arg) => {
  if (arg) {
    if (arg["url"] && arg["width"] && arg["height"]) {
      createWidgetWindow(arg["url"], arg["width"], arg["height"]);
    }
  }
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", () => {
  createWindow(),
    createDbWindow(),
    createMediaWindow(),
    console.log(process.versions.electron);
});

// Quit when all windows are closed.
app.on("window-all-closed", () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow(), createDbWindow(), createMediaWindow();
  }
});
