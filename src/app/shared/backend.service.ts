import { Injectable } from '@angular/core';

/**
 * BackendService — browser replacement for ngx-electron's ElectronService.
 *
 * Exposes an `ipcRenderer`-compatible facade (send / sendSync / on /
 * removeAllListeners) whose channels are mapped onto the typed HTTP APIs of
 * the local CogniMap backend (server/). This keeps the ~40 existing call
 * sites working unchanged while removing every Electron dependency.
 *
 * - `sendSync` uses synchronous XHR against the local server. The old
 *   Electron `sendSync` was equally blocking; latency on localhost is
 *   comparable. Marked as technical debt in docs/ARCHITECTURE.md.
 * - `send` fires an async request; reply channels (`loadedCME`,
 *   `changedCME`, ...) are emitted to listeners registered via `on`,
 *   mirroring the old main-process broadcasts.
 */

type Listener = (event: any, data: any) => void;

interface RouteResult {
  value?: any;
  emit?: Array<{ channel: string, data: any }>;
}

@Injectable()
export class BackendService {
  public ipcRenderer: IpcShim;
  public isElectronApp: boolean = false;

  constructor() {
    this.ipcRenderer = new IpcShim();
  }
}

export class IpcShim {
  private listeners: { [channel: string]: Listener[] } = {};
  private lastPasteAction: any = { type: 'empty', payload: '' };
  private pendingPaste: ((action: any) => void) | null = null;
  private pendingPasteTimer: any = null;

  constructor() {
    // capture paste events so legacy clipboard flows keep working
    if (typeof document !== 'undefined') {
      document.addEventListener('paste', (e: ClipboardEvent) => this.capturePaste(e));
    }
  }

  // ---------------------------------------------------------------
  // ipcRenderer-compatible surface
  // ---------------------------------------------------------------

  public on(channel: string, listener: Listener): void {
    if (!this.listeners[channel]) {
      this.listeners[channel] = [];
    }
    this.listeners[channel].push(listener);
  }

  public removeAllListeners(channel: string): void {
    delete this.listeners[channel];
  }

  public emit(channel: string, data: any): void {
    const subs = this.listeners[channel];
    if (subs) {
      for (const cb of subs.slice()) {
        try {
          cb({ channel: channel }, data);
        } catch (err) {
          console.error('[backend] listener error on', channel, err);
        }
      }
    }
  }

  /**
   * Wait for the browser paste event that follows a Ctrl+V keydown, then
   * call back with the legacy getClipboard action shape. Falls back to the
   * last captured action if no paste event arrives (e.g. empty clipboard).
   */
  public nextPaste(cb: (action: any) => void): void {
    this.pendingPaste = cb;
    if (this.pendingPasteTimer) {
      clearTimeout(this.pendingPasteTimer);
    }
    this.pendingPasteTimer = setTimeout(() => {
      if (this.pendingPaste) {
        const pending = this.pendingPaste;
        this.pendingPaste = null;
        pending(this.lastPasteAction);
      }
    }, 500);
  }

  public sendSync(channel: string, arg?: any): any {
    switch (channel) {
      case 'loadSettings':
        return this.xhrSync('GET', '/api/settings/' + encodeURIComponent(arg));
      case 'loadSpeChars':
        return this.xhrSync('GET', '/api/spechars');
      case 'changeSpeChars': {
        const res = this.xhrSync('PUT', '/api/spechars', arg);
        return res ? 'changeSpeChars' : undefined;
      }
      case 'loadTemplates':
        return this.xhrSync('GET', '/api/templates');
      case 'getCME':
        return this.orUndefined(this.xhrSync('GET', '/api/cme/id/' + encodeURIComponent(arg)));
      case 'getCMETitle':
        return this.orUndefined(this.xhrSync('GET', '/api/cme/title/' + encodeURIComponent(arg)));
      case 'getAllPrio':
        return this.xhrSync('GET', '/api/cme/prio/' + encodeURIComponent(arg));
      case 'saveMM': {
        const res = this.xhrSync('PUT', '/api/minimap', arg);
        return res ? true : false;
      }
      case 'searchDb':
        this.xhrSync('POST', '/api/db/search', {});
        return undefined; // legacy handler body was commented out
      case 'makeMjSVG': {
        const res = this.xhrSync('POST', '/api/media/mathjax', { tex: arg });
        if (!res || res.result === 'error' || res.errors) {
          return 'error';
        }
        return res;
      }
      case 'makeTrans': {
        const res = this.xhrSync('POST', '/api/media/transparent', arg);
        return res ? res.file : arg && arg.file;
      }
      case 'loadFile': {
        const res = this.xhrSync('POST', '/api/assets/resolve', { path: arg });
        return res ? res.path : undefined;
      }
      case 'readAssetFiles':
        return this.xhrSync('POST', '/api/assets/list', arg);
      case 'saveDb': {
        const res = this.xhrSync('POST', '/api/db/save', { file: arg });
        return res ? res.status : 'error saving database';
      }
      case 'loadDb': {
        const res = this.xhrSync('POST', '/api/db/load', { file: arg });
        return res ? res.status : 'error loading database';
      }
      case 'deleteDb': {
        const res = this.xhrSync('POST', '/api/db/delete', {});
        return res ? res.status : 'error deleting database';
      }
      case 'openBrowser': {
        const res = this.xhrSync('POST', '/api/media/open', arg);
        if (res && res.action === 'open-url') {
          window.open(res.url, '_blank');
          return res.status;
        }
        return res && res.status ? res.status : 'Can not open: ' + JSON.stringify(arg);
      }
      case 'undoCME':
        return this.xhrSync('POST', '/api/cme/undo', {});
      case 'loadViz3d':
        return this.xhrSync('GET', '/api/viz3d');
      case 'redoCME':
        return this.xhrSync('POST', '/api/cme/redo', {});
      case 'getClipboard':
        return this.lastPasteAction;
      // dead legacy channels (had no main-process handler): keep old
      // semantics of returning undefined
      case 'getAllCME':
      case 'getPicture':
        return undefined;
      default:
        console.warn('[backend] unmapped sendSync channel:', channel);
        return undefined;
    }
  }

  public send(channel: string, arg?: any): void {
    switch (channel) {
      case 'changeSettings':
        this.request('PUT', '/api/settings', arg).then((res) => {
          if (res) { this.emit('changedSettings', res); }
        });
        return;
      case 'loadButtons':
        this.request('GET', '/api/buttons').then((res) => this.emit('loadedButtons', res));
        return;
      case 'loadColors':
        this.request('GET', '/api/colors').then((res) => this.emit('loadedColors', res));
        return;
      case 'changeColors':
        this.request('PUT', '/api/colors/item', arg).then((res) => this.emit('changedColors', res));
        return;
      case 'changeAllColors':
        this.request('PUT', '/api/colors', arg).then((res) => this.emit('changedColors', res));
        return;
      case 'addColors':
        this.request('POST', '/api/colors', arg).then((res) => this.emit('changedColors', res));
        return;
      case 'changeButtons':
        this.request('PUT', '/api/buttons/item', arg).then((res) => {
          if (res) { this.emit('changedButtons', res); }
        });
        return;
      case 'changeTemplate':
        this.request('PUT', '/api/templates/item', arg).then((res) => {
          if (res) { this.emit('changedTemplate', res); }
        });
        return;
      case 'newTemplate':
        this.request('POST', '/api/templates', arg).then(
          (res) => this.emit('newTemplateResponse', res ? 'saved' : 'error'),
        );
        return;
      case 'loadCME':
        this.request('POST', '/api/cme/query', arg).then((res) => this.emit('loadedCME', res));
        return;
      case 'newCME':
        this.request('POST', '/api/cme', arg);
        return;
      case 'changeCME':
        this.request('PUT', '/api/cme', arg).then((res) => {
          if (res && res.data) {
            this.emit('changedCME', res.data);
            if (res.catChanged && res.catChanged.length > 0) {
              this.emit('changedCME', res.catChanged);
            }
          }
        });
        return;
      case 'delCME':
        this.request('DELETE', '/api/cme/' + encodeURIComponent(arg)).then(
          (res) => this.emit('deletedCME', res),
        );
        return;
      case 'findChildren':
        this.request('POST', '/api/cme/children', arg).then(
          (res) => this.emit('selectedChildren', res),
        );
        return;
      case 'findArea':
        this.request('POST', '/api/cme/area', arg).then(
          (res) => this.emit('selectedChildren', res),
        );
        return;
      case 'getMaxID':
        this.request('GET', '/api/cme/maxid?gt=' + encodeURIComponent(arg || 0)).then(
          (res) => this.emit('maxID', res ? res.maxid : arg),
        );
        return;
      case 'getSince':
        this.request('GET', '/api/cme/since/' + encodeURIComponent(arg)).then(
          (res) => this.emit('changedSince', res),
        );
        return;
      case 'loadMM':
        this.request('GET', '/api/minimap').then((res) => this.emit('loadedMM', res));
        return;
      case 'loadQuizes':
        this.request('POST', '/api/quiz/load', { limit: arg }).then(
          (res) => this.emit('loadedQuizes', res),
        );
        return;
      case 'loadQuizesbyCat':
        this.request('POST', '/api/quiz/bycat', { params: arg }).then(
          (res) => this.emit('loadedQuizes', res),
        );
        return;
      case 'unQuiz':
        this.request('POST', '/api/quiz/unquiz', {}).then(
          (res) => this.emit('loadedQuizes', res),
        );
        return;
      case 'answerQuiz':
        this.request('POST', '/api/quiz/answer', arg).then((res) => {
          if (res && !res.unchanged) { this.emit('loadedQuizes', res); }
        });
        return;
      case 'saveViz3d':
        this.request('PUT', '/api/viz3d', arg);
        return;
      case 'openWidget':
        // old behavior: open a native BrowserWindow — now a browser popup
        if (arg && arg.url) {
          const url = String(arg.url).replace(/^\/\/[^\/]+/, '');
          window.open(url, '_blank',
            'width=' + (arg.width || 800) + ',height=' + (arg.height || 600));
        }
        return;
      case 'WinClosed':
        return; // dead channel in the old app as well
      default:
        console.warn('[backend] unmapped send channel:', channel);
    }
  }

  // ---------------------------------------------------------------
  // helpers
  // ---------------------------------------------------------------

  /** synchronous XHR — replicates ipcRenderer.sendSync's blocking semantics */
  private xhrSync(method: string, url: string, body?: any): any {
    const xhr = new XMLHttpRequest();
    xhr.open(method, url, false);
    if (body !== undefined) {
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.send(JSON.stringify(body));
    } else {
      xhr.send();
    }
    if (xhr.status >= 200 && xhr.status < 300) {
      try {
        return JSON.parse(xhr.responseText);
      } catch (err) {
        return undefined;
      }
    }
    console.error('[backend] sync request failed:', method, url, xhr.status, xhr.responseText);
    return undefined;
  }

  private request(method: string, url: string, body?: any): Promise<any> {
    const options: any = { method: method, headers: {} };
    if (body !== undefined) {
      options.headers['Content-Type'] = 'application/json';
      options.body = JSON.stringify(body);
    }
    return fetch(url, options).then((res) => {
      if (!res.ok) {
        return res.json().then(
          (err) => {
            console.error('[backend] request failed:', method, url, res.status, err);
            return undefined;
          },
          () => undefined,
        );
      }
      return res.json();
    }).catch((err) => {
      console.error('[backend] request error:', method, url, err);
      return undefined;
    });
  }

  private orUndefined(value: any): any {
    return value === null ? undefined : value;
  }

  /**
   * Builds the legacy getClipboard action shape from a browser paste event.
   * Image paste uploads the blob synchronously so the action is complete
   * before the legacy keyboard handler asks for it.
   */
  private capturePaste(e: ClipboardEvent): void {
    const cd = e.clipboardData;
    if (!cd) { return; }
    this.buildPasteAction(cd);
    if (this.pendingPaste) {
      const pending = this.pendingPaste;
      this.pendingPaste = null;
      if (this.pendingPasteTimer) {
        clearTimeout(this.pendingPasteTimer);
        this.pendingPasteTimer = null;
      }
      pending(this.lastPasteAction);
    }
  }

  private buildPasteAction(cd: DataTransfer): void {
    // image first — matches the old Electron format priority
    for (let i = 0; i < cd.items.length; i++) {
      const item = cd.items[i];
      if (item.type === 'image/png') {
        const file = item.getAsFile();
        if (file) {
          const xhr = new XMLHttpRequest();
          xhr.open('POST', '/api/media/clipboard-image', false);
          xhr.setRequestHeader('Content-Type', 'image/png');
          xhr.send(file);
          if (xhr.status >= 200 && xhr.status < 300) {
            this.lastPasteAction = JSON.parse(xhr.responseText);
            return;
          }
        }
      }
    }
    const html = cd.getData('text/html');
    if (html) {
      this.lastPasteAction = { type: 'html', payload: html, info: 'html' };
      return;
    }
    const text = cd.getData('text/plain');
    if (text) {
      try {
        const input = JSON.parse(text);
        this.lastPasteAction = { type: input.type, payload: input.object, info: input.info };
      } catch (err) {
        this.lastPasteAction = { type: 'text', payload: text, info: err };
      }
      return;
    }
    this.lastPasteAction = { type: 'empty', payload: '' };
  }
}
