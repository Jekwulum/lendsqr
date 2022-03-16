require('dotenv').config();
const cors = require('cors');
const express = require('express');

global.appName = 'Lendsqr API';
global.version = 'v1';

const apiRouter = require('./routes/api.routes');
const port = process.env.PORT || 4000;

const app = express();
app.listen(port, () => console.log(`[${appName}]: http://localhost:${port}`));


app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.use(`/apis/${global.version}`, apiRouter);

module.exports = app;