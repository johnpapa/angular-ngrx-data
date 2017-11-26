const Hero = require('./hero.model');
const ReadPreference = require('mongodb').ReadPreference;

require('./mongo').connect();

function getHeroes(req, res) {
  const docquery = Hero.find({}).read(ReadPreference.NEAREST);
  docquery
    .exec()
    .then(heroes => res.status(200).json(heroes))
    .catch(error => res.status(500).send(error));
}

function postHero(req, res) {
  const originalHero = {
    id: req.body.id,
    name: req.body.name,
    saying: req.body.saying,
    createdBy: req.user.username
  };
  const hero = new Hero(originalHero);
  hero.save(error => {
    if (checkServerError(res, error)) return;
    res.status(201).json(hero);
    console.log('Hero created successfully!');
  });
}

function putHero(req, res) {
  const updatedHero = {
    id: parseInt(req.params.id, 10),
    name: req.body.name,
    saying: req.body.saying,
    updatedBy: req.user.username
  };

  Hero.findOneAndUpdate(
    { id: updatedHero.id },
    { $set: updatedHero },
    { upsert: true, new: true },
    (error, doc) => {
      if (checkServerError(res, error)) return;
      res.status(200).json(doc);
      console.log('Hero updated successfully!');
    }
  );
}

function deleteHero(req, res) {
  const id = parseInt(req.params.id, 10);
  Hero.findOneAndRemove({ id: id })
    .then(hero => {
      if (!checkFound(res, hero)) return;
      res.status(200).json(hero);
      console.log('Hero deleted successfully!');
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

function checkFound(res, hero) {
  if (!hero) {
    res.status(404).send('Hero not found.');
    return;
  }
  return hero;
}

module.exports = {
  getHeroes,
  postHero,
  putHero,
  deleteHero
};
