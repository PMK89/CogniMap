import { ElementRef } from '@angular/core';

/**
 * Typed adapter for the iframe-hosted plugins (JSME chemical editor and the
 * SVG editor). Both plugins expose the same same-origin DOM contract:
 *
 *  - #svg_textarea : plugin output — JSON string
 *      { type: 'jsme-svg' | 'svg', object: <payload>, info: <extra> }
 *  - #cminput      : plugin input — content the app wants loaded
 *  - #structure    : (JSME only) SMILES input line
 *
 * Output flows into the app through the clipboard/paste path (the JSON in
 * #svg_textarea is copied and pasted onto a selected element, handled by
 * EventService), matching the original workflow.
 */
export interface WidgetOutput {
  type: string;
  object: any;
  info?: any;
}

export class WidgetIframeAdapter {
  constructor(private iframe: ElementRef) {}

  private get doc(): Document | null {
    if (!this.iframe || !this.iframe.nativeElement) { return null; }
    return this.iframe.nativeElement.contentDocument
      || (this.iframe.nativeElement.contentWindow
          && this.iframe.nativeElement.contentWindow.document)
      || null;
  }

  /** Read and parse the plugin's current output, or null if none. */
  public readOutput(): WidgetOutput | null {
    const doc = this.doc;
    if (!doc) { return null; }
    const output = doc.getElementById('svg_textarea') as HTMLTextAreaElement;
    if (!output || !output.value) { return null; }
    try {
      return JSON.parse(output.value);
    } catch (err) {
      return { type: 'raw', object: output.value };
    }
  }

  /** Push content into the plugin's input element. */
  public writeInput(content: string): boolean {
    const doc = this.doc;
    if (!doc) { return false; }
    const input = doc.getElementById('cminput');
    if (!input) { return false; }
    (input as HTMLTextAreaElement).value !== undefined
      ? (input as HTMLTextAreaElement).value = content
      : input.innerHTML = content;
    // notify the plugin that new input is available
    const evt = doc.createEvent('Event');
    evt.initEvent('cminput-changed', true, false);
    input.dispatchEvent(evt);
    return true;
  }

  /** JSME only: load a SMILES structure string. */
  public loadStructure(structure: string): boolean {
    const doc = this.doc;
    if (!doc) { return false; }
    const el = doc.getElementById('structure') as HTMLInputElement;
    if (!el) { return false; }
    el.value = structure;
    return true;
  }
}
