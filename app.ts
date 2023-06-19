const app = require('express')();

import infoRouter from './routes/info.router';
import fileRouter from './routes/file.router';
import { authenticate } from './middleware/authentication.middleware';

app.use(authenticate);

app.use('/info', infoRouter);

app.use('/file', fileRouter);

export default app;
