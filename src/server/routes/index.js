const express = require('express');
const router = express.Router();

router.use('/', require('./hero.routes'));
router.use('/', require('./villain.routes'));
router.use('/', require('./todo.routes'));
module.exports = router;
