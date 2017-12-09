const mongoose = require('mongoose');
const counter = require('./counter');

const Schema = mongoose.Schema;
const heroSchema = new Schema(
  {
    id: { type: Number, default: 0 },
    name: String,
    saying: String
  },
  {
    collection: 'heroes',
    read: 'nearest'
  }
);

heroSchema.pre('save', function(next) {
  counter.increment('heroes', this, next);
});

const Hero = mongoose.model('Hero', heroSchema);

module.exports = Hero;
