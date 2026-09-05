'use strict';
// Literal subsequence ranking; never executes a user-supplied regular expression.
function searchNodes(docs, query, type, limit = 40) {
  const q = String(query || '').trim().toLocaleLowerCase();
  if (!q) return [];
  const results = [];
  for (const doc of docs) {
    if (doc.id <= 0 || (type && (!doc.types || doc.types[0] !== type))) continue;
    const title = String(doc.title || '').toLocaleLowerCase();
    let score = title === q ? 0 : title.startsWith(q) ? 1 : title.includes(q) ? 2 : 3;
    if (score === 3) {
      let offset = 0;
      for (const character of q) { offset = title.indexOf(character, offset); if (offset < 0) break; offset++; }
      if (offset < 0) continue;
      score += (title.length - q.length) / 1000;
    }
    results.push({ id: doc.id, title: doc.title, coor: doc.coor, types: doc.types, score });
  }
  results.sort((a, b) => a.score - b.score || a.id - b.id);
  return results.slice(0, limit);
}
module.exports = { searchNodes };
