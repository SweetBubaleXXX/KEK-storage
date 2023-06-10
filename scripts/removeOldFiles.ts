const { removeOldFilesPromise } = require('../utils/file.utils');

removeOldFilesPromise().catch(console.error);
