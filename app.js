const app = require('express')();

const { authenticate } = require('./middleware/authentication.middleware');
const infoRoutes = require('./routes/info.routes');
const fileRoutes = require('./routes/file.routes');

app.use(authenticate);

app.use('/info', infoRoutes);

app.use('/file', fileRoutes);

module.exports = app;
