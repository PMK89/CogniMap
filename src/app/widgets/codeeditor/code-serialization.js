'use strict';
// Serialize the complete source, independent of CodeMirror's virtual viewport.
function escapeXml(text) {
  return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function codeSvg(text, tokenize) {
  const colors = { keyword: '#8959a8', string: '#718c00', comment: '#65737e', number: '#f5871f', builtin: '#4271ae', def: '#4271ae', variable: '#20242c', operator: '#3e999f' };
  const output = [];
  tokenize(text, (token, style) => {
    const color = colors[String(style || '').split(' ')[0]] || '#20242c';
    output.push('<span style="color:' + color + '">' + escapeXml(token) + '</span>');
  });
  const lines = text.split('\n');
  const width = Math.max(120, Math.min(16000, lines.reduce((n, line) => Math.max(n, line.replace(/\t/g, '    ').length), 0) * 8 + 24));
  const height = Math.min(4096, Math.max(40, lines.length * 20 + 24));
  return { width, height, svg: '<svg xmlns="http://www.w3.org/2000/svg" width="' + width + '" height="' + height + '"><foreignObject width="100%" height="100%"><div xmlns="http://www.w3.org/1999/xhtml" style="background:#fff;padding:12px;color:#20242c;height:' + (height - 24) + 'px;overflow:auto"><pre style="margin:0;font:14px/20px monospace;tab-size:4;white-space:pre-wrap;overflow-wrap:anywhere">' + output.join('') + '</pre></div></foreignObject></svg>' };
}
module.exports = { codeSvg, escapeXml };
