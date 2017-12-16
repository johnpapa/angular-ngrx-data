if (!process.env.NODE_ENV) {
  console.error(
    'ENV variables are missing.',
    'Verify that you have set them directly or in a .env file.'
  );
  process.exit(1);
}

const express = require('express');
const bodyParser = require('body-parser');
const router = express.Router();
const routes = require('./routes');

const publicweb = process.env.PUBLICWEB;
const port = process.env.PORT;

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(publicweb));
console.log(`serving ${publicweb}`);
app.use('/api', routes);
app.get('*', (req, res) => {
  res.sendFile(`index.html`, { root: publicweb });
});

app.listen(port, () => console.log(`API running on http://localhost:${port}`));
