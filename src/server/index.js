const express = require('express');
const bodyParser = require('body-parser');

const envFile = './env/' + process.env.NODE_ENV;
const env = require(envFile);
const routes = require('./routes');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(env.publicWeb));
console.log(`serving ${env.publicWeb}`);
app.use('/api', routes);
app.get('*', (req, res) => {
  res.sendFile(`index.html`, { root: env.publicWeb });
});

app.listen(env.serverPort, () => console.log(`API running on http://localhost:${env.serverPort}`));
