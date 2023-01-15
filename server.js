const app = require('./app');
const { PORT } = require('./config');
const { removeOldFiles } = require('./utils/file.utils');

removeOldFiles(err => { if (err) console.error(err) });

app.listen(PORT, () => {
    console.log(`Running on PORT - ${PORT}`);
});
