const electron = require('electron');
const fs = require('fs');
const CMSettings = require('./models/settings');
const CMButton = require('./models/button');
const CMColor = require('./models/color');
const path = require('path');
const jsonp = require('jsonp');
const ipc = electron.ipcMain

// loads jsonfiles for settings and templates
var settings = JSON.parse(fs.readFileSync('./data/settings.json'));
var colors = JSON.parse(fs.readFileSync('./data/colors.json'));
var spechars = JSON.parse(fs.readFileSync('./data/spechars.json'));
var buttons = JSON.parse(fs.readFileSync('./data/buttons.json'));
var templates = JSON.parse(fs.readFileSync('./data/templates.json'));

// var file = fs.existsSync('./src/assets/snap.svg.js');
// console.log(file);

// ----------------------------------------
// get settings and handles setting changes
// ----------------------------------------

// get settings
ipc.on('loadSettings', function (event, arg) {
  for (var i = 0; i < settings.length; i++) {
    if(settings[i]) {
      if (settings[i].id === parseInt(arg)) {
        event.returnValue = settings[i]
      }
    }
  }
})

// change setting
ipc.on('changeSettings', function (event, arg) {
  for (var i = 0; i < settings.length; i++) {
    if(settings[i]) {
      if (settings[i].id === parseInt(arg.id)) {
        settings[i] = arg;
        if (settings[i].mode !== 'view') {
          settings[i].mode = 'edit';
        }
        console.log(settings[i].mode);
        event.sender.send('changedSettings', settings[i])
      }
      var str_settings = JSON.stringify(settings, null, 2);
      fs.writeFileSync('./data/settings.json', str_settings);
    }
  }
})

// --------------------------------------
// get buttons and handles button changes
// --------------------------------------

// get buttons
ipc.on('loadButtons', function (event, arg) {
  event.sender.send('loadedButtons', buttons)
})

// change button
ipc.on('changeButtons', function (event, arg) {
  for (var i = 0; i < buttons.length; i++) {
    if(buttons[i]) {
      if (buttons[i].id === parseInt(arg.id)) {
        buttons[i] = arg;
        event.sender.send('changedButtons', buttons[i])
      }
    }
  }
})

// ------------------------------------
// get colors and handles color changes
// ------------------------------------

// get colors
ipc.on('loadColors', function (event, arg) {
  event.sender.send('loadedColors', colors)
})

// change colors
ipc.on('changeColors', function (event, arg) {
  for (var i = 0; i < colors.length; i++) {
    if(colors[i]) {
      if (colors[i].id === parseInt(arg.id)) {
        colors[i] = arg;
      }
    }
  }
  event.sender.send('changedColors', colors)
  var str_colors = JSON.stringify(colors, null, 2);
  fs.writeFileSync('./data/colors.json', str_colors);
})

// change all colors
ipc.on('changeAllColors', function (event, arg) {
  colors = arg;
  var str_colors = JSON.stringify(arg, null, 2);
  event.sender.send('changedColors', colors);
  fs.writeFileSync('./data/colors.json', str_colors);
})

// add colors
ipc.on('addColors', function (event, arg) {
  let maxid = 0;
  for (var i = 0; i < colors.length; i++) {
    if (colors[i]) {
      if (colors[i].cat === arg.cat) {
        if (colors[i].prio === 0) {
          colors[i].prio = 1;
        }
      }
      if (colors[i].id > maxid) {
        maxid = colors[i].id;
      }
      console.log(maxid, colors[i].id)
    }
  }
  arg.id = maxid + 1;
  console.log(arg.id);
  colors.push(arg);
  event.sender.send('changedColors', colors);
  var str_colors = JSON.stringify(colors, null, 2);
  fs.writeFileSync('./data/colors.json', str_colors);
})

// ------------------------------------
// get special characters and handles color changes
// ------------------------------------

// get colors
ipc.on('loadSpeChars', function (event, arg) {
  event.returnValue = spechars;
})

// change colors
ipc.on('changeSpeChars', function (event, arg) {
  spechars = arg;
  var str_spechars = JSON.stringify(spechars, null, 2);
  fs.writeFileSync('./data/spechars.json', str_spechars);
  event.returnValue = 'changeSpeChars';
})

// -------------------------------------------
// get templates and handles templates changes
// -------------------------------------------

// get templates
ipc.on('loadTemplates', function (event, arg) {
  event.returnValue = templates;
})

// change templates
ipc.on('changeTemplate', function (event, arg) {
  for (var i = 0; i < templates.length; i++) {
    if(templates[i]) {
      if (templates[i].id === arg.id) {
        arg.state = '';
        templates[i] = arg;
        event.sender.send('changedTemplate', templates[i])
      }
    }
  }
  var str_templates = JSON.stringify(templates, null, 2);
  fs.writeFileSync('./data/templates.json', str_templates);
})

// new templates
ipc.on('newTemplate', function (event, arg) {
  var unique = true;
  for (var i = 0; i < templates.length; i++) {
    if(templates[i]) {
      if (templates[i].id === arg.id) {
        unique = false;
      }
    }
  }
  if (unique) {
    templates.push(arg);
    var str_templates = JSON.stringify(templates, null, 2);
    fs.writeFileSync('./data/templates.json', str_templates);
    event.sender.send('newTemplateResponse', 'saved');
  } else {
    event.sender.send('newTemplateResponse', 'error');
  }
})
