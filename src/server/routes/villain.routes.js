const express = require('express');
const router = express.Router();

const services = require('../services');
const villainService = services.villainService;

router.get('/villains', (req, res) => {
  villainService.getVillains(req, res);
});

router.post('/villain', (req, res) => {
  villainService.postVillain(req, res);
});

router.put('/villain/:id', (req, res) => {
  villainService.putVillain(req, res);
});

router.delete('/villain/:id', (req, res) => {
  villainService.deleteVillain(req, res);
});

module.exports = router;
