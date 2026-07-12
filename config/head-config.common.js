/**
 * Configuration for head elements added during the creation of index.html.
 *
 * The old icon set referenced /assets/icon/*, which never existed in the
 * repository and produced a stream of 404s on every load. A single SVG
 * favicon is used instead.
 */
module.exports = {
  link: [
    { rel: 'icon', type: 'image/svg+xml', href: '/assets/favicon.svg' }
  ],
  meta: [
    { name: 'theme-color', content: '#2f6fed' }
  ]
};
