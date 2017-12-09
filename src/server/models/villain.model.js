const mongoose = require('mongoose');
const counter = require('./counter');

const Schema = mongoose.Schema;
const villainSchema = new Schema(
  {
    id: { type: Number, default: 0 },
    name: String,
    saying: String
  },
  {
    collection: 'villains',
    read: 'nearest'
  }
);

villainSchema.pre('save', function(next) {
  counter.increment('villains', this, next);
});

const Villain = mongoose.model('Villain', villainSchema);

module.exports = Villain;
