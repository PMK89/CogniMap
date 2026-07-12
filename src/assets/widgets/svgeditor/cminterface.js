/**
 * CogniMap bridge for the embedded SVG editor.
 *
 * Mirrors the JSME editor's same-origin contract so the app's
 * WidgetIframeAdapter and copy/paste flow work identically:
 *   - #svg_textarea : output — JSON { type: 'svg', object: <svg string>, info }
 *   - #cminput      : input — SVG string the app wants loaded into the canvas
 *   - a "CM" button that serializes the current drawing into #svg_textarea
 *     and copies it to the clipboard, ready to paste onto a map element.
 */
(function () {
  'use strict';

  function init() {
    if (!window.svgCanvas) {
      // editor not ready yet — svg-editor.js sets window.svgCanvas on init
      setTimeout(init, 250);
      return;
    }
    if (document.getElementById('cminterface')) { return; }

    var bar = document.createElement('div');
    bar.id = 'cminterface';
    bar.style.cssText = 'position:absolute;top:0;right:0;z-index:10000;' +
      'background:#e8e8e8;padding:2px 4px;display:flex;gap:4px;align-items:center;' +
      'font:12px sans-serif;border-bottom-left-radius:4px;';

    var button = document.createElement('button');
    button.type = 'button';
    button.id = 'cmexport';
    button.textContent = 'CM';
    button.title = 'Export drawing for CogniMap (copies JSON to clipboard — paste onto a selected element)';

    var output = document.createElement('input');
    output.type = 'text';
    output.id = 'svg_textarea';
    output.style.cssText = 'width:120px;';
    output.setAttribute('aria-label', 'CogniMap export data');

    var input = document.createElement('textarea');
    input.id = 'cminput';
    input.style.display = 'none';

    var cmoutput = document.createElement('div');
    cmoutput.id = 'cmoutput';
    cmoutput.style.display = 'none';

    button.addEventListener('click', function () {
      try {
        var svg = window.svgCanvas.getSvgString();
        var payload = JSON.stringify({ type: 'svg', object: svg, info: 'svgeditor' });
        output.value = payload;
        output.select();
        try {
          document.execCommand('copy');
        } catch (err) { /* clipboard best-effort; value stays selectable */ }
      } catch (err) {
        output.value = 'error: ' + err.message;
      }
    });

    input.addEventListener('cminput-changed', function () {
      if (input.value) {
        try {
          window.svgCanvas.setSvgString(input.value);
        } catch (err) {
          // invalid SVG input — leave canvas untouched
        }
      }
    });

    bar.appendChild(button);
    bar.appendChild(output);
    bar.appendChild(input);
    bar.appendChild(cmoutput);
    document.body.appendChild(bar);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
