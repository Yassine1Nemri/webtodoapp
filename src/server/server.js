const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static('src')); // serve your HTML and JS

const DB_PATH = path.join(__dirname, 'todos.json');

// Read todos from JSON file
const getTodos = () => {
  if (!fs.existsSync(DB_PATH)) return [];
  const data = fs.readFileSync(DB_PATH);
  return JSON.parse(data);
};

// Write todos to JSON file
const saveTodos = (todos) => {
  fs.writeFileSync(DB_PATH, JSON.stringify(todos, null, 2));
};

// API: Get all todos
app.get('/api/todos', (req, res) => {
  res.json(getTodos());
});

// API: Add a todo
app.post('/api/todos', (req, res) => {
  const todos = getTodos();
  const newTodo = {
    id: Date.now(),
    text: req.body.text,
    priority: req.body.priority || 'low',
    completed: false,
    createdAt: new Date().toISOString(),
  };
  todos.unshift(newTodo);
  saveTodos(todos);
  res.json(newTodo);
});

// API: Toggle complete
app.put('/api/todos/:id', (req, res) => {
  let todos = getTodos();
  todos = todos.map(todo =>
    todo.id == req.params.id ? { ...todo, completed: !todo.completed } : todo
  );
  saveTodos(todos);
  res.json({ success: true });
});

// API: Delete todo
app.delete('/api/todos/:id', (req, res) => {
  let todos = getTodos();
  todos = todos.filter(todo => todo.id != req.params.id);
  saveTodos(todos);
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
