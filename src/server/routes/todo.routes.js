const express = require('express');
const router = express.Router();

const services = require('../services');
const todoService = services.todoService;

router.get('/todos', (req, res) => {
  todoService.getTodos(req, res);
});

router.post('/todo', (req, res) => {
    todoService.postTodo(req, res);
});

router.put('/todo/:id', (req, res) => {
    todoService.putTodo(req, res);
});

router.delete('/todo/:id', (req, res) => {
    todoService.deleteTodo(req, res);
});

module.exports = router;
