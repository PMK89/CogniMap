'use strict';

const express = require('express');
const { JsonStore } = require('../lib/jsonstore');
const { badRequest, notFound, conflict } = require('../lib/errors');
const { validators } = require('../lib/validate');

/**
 * Config APIs: settings, buttons, colors, special characters, templates.
 * Ports the behavior of the old Electron settingsController.js 1:1.
 */
function createConfigRouter() {
  const router = express.Router();

  const settingsStore = new JsonStore('settings.json');
  const buttonsStore = new JsonStore('buttons.json');
  const colorsStore = new JsonStore('colors.json');
  const specharsStore = new JsonStore('spechars.json');
  const templatesStore = new JsonStore('templates.json');

  // ---- settings ----

  // old channel: loadSettings
  router.get('/settings/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) throw badRequest('settings id must be an integer');
    const settings = settingsStore.load();
    const found = settings.find((s) => s && s.id === id);
    if (!found) throw notFound(`no settings with id ${id}`);
    res.json(found);
  });

  // old channel: changeSettings
  router.put('/settings', (req, res) => {
    const arg = req.body;
    if (!validators.settings(arg)) {
      throw badRequest('invalid settings payload', validators.settings.errors);
    }
    const settings = settingsStore.load();
    const idx = settings.findIndex((s) => s && s.id === parseInt(arg.id, 10));
    if (idx === -1) throw notFound(`no settings with id ${arg.id}`);
    settings[idx] = arg;
    // preserved quirk from settingsController.js: any non-view/quizing mode
    // is normalized back to 'edit' on persist
    if (settings[idx].mode !== 'view' && settings[idx].mode !== 'quizing') {
      settings[idx].mode = 'edit';
    }
    settingsStore.save(settings);
    res.json(settings[idx]);
  });

  // ---- buttons ----

  // old channel: loadButtons
  router.get('/buttons', (req, res) => {
    res.json(buttonsStore.load());
  });

  // old channel: changeButtons (persisted in-memory only in the old code;
  // here we persist to disk so edits survive restarts)
  router.put('/buttons/item', (req, res) => {
    const arg = req.body;
    if (!validators.idObject(arg)) {
      throw badRequest('button payload requires an id', validators.idObject.errors);
    }
    const buttons = buttonsStore.load();
    const idx = buttons.findIndex((b) => b && b.id === parseInt(arg.id, 10));
    if (idx === -1) throw notFound(`no button with id ${arg.id}`);
    buttons[idx] = arg;
    buttonsStore.save(buttons);
    res.json(buttons[idx]);
  });

  // ---- colors ----

  // old channel: loadColors
  router.get('/colors', (req, res) => {
    res.json(colorsStore.load());
  });

  // old channel: changeColors — update one colorbar, return all
  router.put('/colors/item', (req, res) => {
    const arg = req.body;
    if (!validators.idObject(arg)) {
      throw badRequest('color payload requires an id', validators.idObject.errors);
    }
    const colors = colorsStore.load();
    const idx = colors.findIndex((c) => c && c.id === parseInt(arg.id, 10));
    if (idx !== -1) colors[idx] = arg;
    colorsStore.save(colors);
    res.json(colors);
  });

  // old channel: changeAllColors — replace the whole list
  router.put('/colors', (req, res) => {
    const arg = req.body;
    if (!validators.array(arg)) throw badRequest('colors payload must be an array');
    colorsStore.save(arg);
    res.json(arg);
  });

  // old channel: addColors — append with next id; bump prio 0 -> 1 in same cat
  router.post('/colors', (req, res) => {
    const arg = req.body;
    if (!validators.object(arg)) throw badRequest('color payload must be an object');
    const colors = colorsStore.load();
    let maxid = 0;
    for (const c of colors) {
      if (!c) continue;
      if (c.cat === arg.cat && c.prio === 0) c.prio = 1;
      if (c.id > maxid) maxid = c.id;
    }
    arg.id = maxid + 1;
    colors.push(arg);
    colorsStore.save(colors);
    res.json(colors);
  });

  // ---- special characters ----

  // old channel: loadSpeChars
  router.get('/spechars', (req, res) => {
    res.json(specharsStore.load());
  });

  // old channel: changeSpeChars
  router.put('/spechars', (req, res) => {
    const arg = req.body;
    if (!validators.array(arg) && !validators.object(arg)) {
      throw badRequest('spechars payload must be an array or object');
    }
    specharsStore.save(arg);
    res.json({ status: 'changeSpeChars' });
  });

  // ---- templates ----

  // old channel: loadTemplates
  router.get('/templates', (req, res) => {
    res.json(templatesStore.load());
  });

  // old channel: changeTemplate
  router.put('/templates/item', (req, res) => {
    const arg = req.body;
    if (!validators.idObject(arg)) {
      throw badRequest('template payload requires an id', validators.idObject.errors);
    }
    const templates = templatesStore.load();
    const idx = templates.findIndex((t) => t && t.id === arg.id);
    if (idx === -1) throw notFound(`no template with id ${arg.id}`);
    arg.state = '';
    templates[idx] = arg;
    templatesStore.save(templates);
    res.json(templates[idx]);
  });

  // old channel: newTemplate
  router.post('/templates', (req, res) => {
    const arg = req.body;
    if (!validators.idObject(arg)) {
      throw badRequest('template payload requires an id', validators.idObject.errors);
    }
    const templates = templatesStore.load();
    if (templates.some((t) => t && t.id === arg.id)) {
      throw conflict(`template id ${arg.id} already exists`);
    }
    templates.push(arg);
    templatesStore.save(templates);
    res.json({ status: 'saved' });
  });

  return router;
}

module.exports = { createConfigRouter };
