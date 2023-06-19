import morgan from 'morgan';

import infoRouter from './routes/info.router';
import fileRouter from './routes/file.router';
import { authenticate } from './middleware/authentication.middleware';

const app = require('express')();

app.use(morgan(':remote-addr :method :url :status - :response-time ms'));

app.use(authenticate);

app.use('/info', infoRouter);

app.use('/file', fileRouter);

export default app;
