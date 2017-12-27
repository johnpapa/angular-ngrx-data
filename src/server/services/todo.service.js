const models = require('../models');
const Todo = models.Todo;
const ReadPreference = require('mongodb').ReadPreference;

// require('./mongo').connect();

function getTodos(req, res) {
  const docquery = Todo.find({}).read(ReadPreference.NEAREST);
  docquery
    .exec()
    .then(todos => res.status(200).json(todos))
    .catch(error => res.status(500).send(error));
}

function postTodo(req, res) {
  const originalTodo = {
    name: req.body.name,
    check: req.body.check
  };
  const todo = new Todo(originalTodo);
  todo.save(error => {
    if (checkServerError(res, error)) return;
    res.status(201).json(todo);
    console.log('Todo created successfully!');
  });
}

function putTodo(req, res) {
  const updatedTodo = {
    id: parseInt(req.params.id, 10),
    name: req.body.name,
    check: req.body.check
  };

  Todo.findOneAndUpdate(
    { id: updatedTodo.id },
    { $set: updatedTodo },
    { upsert: true, new: true },
    (error, doc) => {
      if (checkServerError(res, error)) return;
      res.status(200).json(doc);
      console.log('Todo updated successfully!');
    }
  );
}

function deleteTodo(req, res) {
  const id = parseInt(req.params.id, 10);
  Todo.findOneAndRemove({ id: id })
    .then(todo => {
      if (!checkFound(res, todo)) return;
      res.status(200).json(todo);
      console.log('Todo deleted successfully!');
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

function checkFound(res, todo) {
  if (!todo) {
    res.status(404).send('Todo not found.');
    return;
  }
  return todo;
}

module.exports = {
  getTodos,
  postTodo,
  putTodo,
  deleteTodo
};
