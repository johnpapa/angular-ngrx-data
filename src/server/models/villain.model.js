const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const villainSchema = new Schema(
  {
    id: { type: Number, required: true, unique: true },
    name: String,
    saying: String
  },
  {
    collection: 'villains',
    read: 'nearest'
  }
);

const Villain = mongoose.model('Villain', villainSchema);

module.exports = Villain;
