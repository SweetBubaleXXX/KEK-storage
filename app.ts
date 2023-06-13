const app = require('express')();

import { authenticate } from './middleware/authentication.middleware';
import infoRoutes from './routes/info.router';
import fileRoutes from './routes/file.router';

app.use(authenticate);

app.use('/info', infoRoutes);

app.use('/file', fileRoutes);

export default app;
