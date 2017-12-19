const models = require('../models');
const Villain = models.Villain;
const ReadPreference = require('mongodb').ReadPreference;

// require('./mongo').connect();

function getVillains(req, res) {
  const docquery = Villain.find({}).read(ReadPreference.NEAREST);
  docquery
    .exec()
    .then(villains => res.status(200).json(villains))
    .catch(error => res.status(500).send(error));
}

function postVillain(req, res) {
  const originalVillain = {
    name: req.body.name,
    saying: req.body.saying
  };
  const villain = new Villain(originalVillain);
  villain.save(error => {
    if (checkServerError(res, error)) return;
    res.status(201).json(villain);
    console.log('Villain created successfully!');
  });
}

function putVillain(req, res) {
  const updatedVillain = {
    id: parseInt(req.params.id, 10),
    name: req.body.name,
    saying: req.body.saying
  };

  Villain.findOneAndUpdate(
    { id: updatedVillain.id },
    { $set: updatedVillain },
    { upsert: true, new: true },
    (error, doc) => {
      if (checkServerError(res, error)) return;
      res.status(200).json(doc);
      console.log('Villain updated successfully!');
    }
  );
}

function deleteVillain(req, res) {
  const id = parseInt(req.params.id, 10);
  Villain.findOneAndRemove({ id: id })
    .then(villain => {
      if (!checkFound(res, villain)) return;
      res.status(200).json(villain);
      console.log('Villain deleted successfully!');
    })
    .catch(error => {
      if (checkServerError(res, error)) return;
    });
}

function checkServerError(res, error) {
  if (error) {
    res.status(500).send(error);
    return error;
  }
}

function checkFound(res, villain) {
  if (!villain) {
    res.status(404).send('Villain not found.');
    return;
  }
  return villain;
}

module.exports = {
  getVillains,
  postVillain,
  putVillain,
  deleteVillain
};
