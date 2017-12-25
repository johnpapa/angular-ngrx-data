const mongoose = require('mongoose');
const counter = require('./counter');

const Schema = mongoose.Schema;
const todoSchema = new Schema(
  {
    id: { type: Number, default: 0 },
    name: String,
    check: String
  },
  {
    collection: 'todo',
    read: 'nearest'
  }
);

todoSchema.pre('save', function(next) {
  counter.increment('todos', this, next);
});

const todo = mongoose.model('todo', todoSchema);

module.exports = todo;
