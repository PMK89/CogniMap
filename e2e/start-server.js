'use strict';

// Playwright starts webServer before globalSetup. Prepare the disposable
// database before NeDB opens it, otherwise it caches an empty database.
require('./global-setup')().then(() => require('../server/index').createApp().listen(3311, '127.0.0.1'));
