import { Component, HostListener, OnDestroy } from '@angular/core';
import { ElementService } from '../shared/element.service';
import { NavigatorService } from '../widgets/navigator/navigator.service';

@Component({ selector: 'app-workspace-tools', templateUrl: './workspace.component.html' })
export class WorkspaceComponent implements OnDestroy {
  public open = false;
  public query = '';
  public type = '';
  public results: any[] = [];
  public recent: any[] = [];
  public error = '';
  public status = '';
  public theme = 'system';
  public preview: any = null;
  public busy = false;
  private canvas: any;
  private timer: any;
  private requestId = 0;
  private previous: { x: number, y: number }[] = [];
  private returnFocus: any;
  constructor(private elements: ElementService, private navigator: NavigatorService) {
    try {
      this.theme = localStorage.getItem('cognimap-theme') || 'system';
      this.recent = JSON.parse(localStorage.getItem('cognimap-recent') || '[]');
      if (!Array.isArray(this.recent)) this.recent = [];
    } catch (_) { this.recent = []; }
  }
  public ngOnDestroy() { clearTimeout(this.timer); this.requestId++; }
  @HostListener('document:keydown', ['$event'])
  public keys(event: KeyboardEvent) {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault(); this.toggle();
    } else if (this.open && event.key === 'Escape') { event.preventDefault(); this.close(); }
    else if (this.open && event.key === 'Tab') {
      const panel = document.getElementById('cm-workspace-panel');
      const items = panel ? panel.querySelectorAll('button:not([disabled]), input, select, a[href]') : [];
      if (!items.length) return;
      const first = items[0] as HTMLElement, last = items[items.length - 1] as HTMLElement;
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  }
  public toggle() {
    if (this.open) return this.close();
    this.returnFocus = document.activeElement;
    this.open = true;
    this.theme = document.documentElement.getAttribute('data-theme') || 'system';
    setTimeout(() => { const input = document.getElementById('cm-global-search'); if (input) input.focus(); });
  }
  public close() { this.open = false; if (this.returnFocus) this.returnFocus.focus(); }
  public setTheme() {
    if (this.theme === 'system') document.documentElement.removeAttribute('data-theme');
    else document.documentElement.setAttribute('data-theme', this.theme);
    try {
      if (this.theme === 'system') localStorage.removeItem('cognimap-theme');
      else localStorage.setItem('cognimap-theme', this.theme);
    } catch (_) { this.status = 'Theme applied for this session; browser storage is unavailable.'; }
  }
  private async request(url: string, body?: any) {
    const response = await fetch(url, body === undefined ? {} : { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error ? result.error.message : 'Request failed');
    return result;
  }
  public search() {
    clearTimeout(this.timer);
    const id = ++this.requestId;
    this.timer = setTimeout(async () => {
      try {
        const results = await this.request('/api/cme/search?q=' + encodeURIComponent(this.query) + '&type=' + encodeURIComponent(this.type));
        if (id === this.requestId) { this.results = results; this.error = ''; }
      } catch (err) { if (id === this.requestId) this.error = err.message; }
    }, 180);
  }
  public async visit(node: any) {
    try {
      const doc = await this.request('/api/cme/id/' + node.id);
      if (!doc || !doc.coor) throw new Error('This node is no longer available.');
      this.previous.push({ x: window.pageXOffset, y: window.pageYOffset });
      if (this.previous.length > 50) this.previous.shift();
      this.navigator.goTo(String(doc.coor.x), String(doc.coor.y));
      this.elements.setSelectedCME(doc.id);
      this.recent = [node].concat(this.recent.filter(n => n.id !== node.id)).slice(0, 12);
      try { localStorage.setItem('cognimap-recent', JSON.stringify(this.recent)); } catch (_) { /* session history remains usable */ }
      this.close();
    } catch (err) { this.error = err.message; }
  }
  public back() { const point = this.previous.pop(); if (point) { window.scrollTo(point.x, point.y); this.close(); } }
  public async readCanvas(event: any) {
    this.preview = null; this.error = ''; this.status = '';
    const file = event.target.files[0];
    if (!file) return;
    this.busy = true;
    try {
      this.canvas = JSON.parse(await file.text());
      this.preview = await this.request('/api/canvas/preview', { canvas: this.canvas });
    } catch (err) { this.error = err.message; }
    finally { this.busy = false; event.target.value = ''; }
  }
  public async importCanvas() {
    this.busy = true;
    try {
      const result = await this.request('/api/canvas/import', { canvas: this.canvas, token: this.preview.token });
      this.status = result.inserted + ' documents imported. Search to navigate to them.';
      this.preview = null; this.canvas = null; this.search();
    } catch (err) { this.error = err.message; }
    finally { this.busy = false; }
  }
}
