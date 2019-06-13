let app = new View({
  view: "body",
  model: {
    todos: [],
    newTodo: "",
    editedTodo: null,
    display: "none"
  },
  action: {
    addTodo() {
      var value = this.newTodo && this.newTodo.trim()
      if (!value) return;
      this.todos.push({
        id: Date.parse(new Date()),
        title: value,
        completed: false
      })
      this.newTodo = "";
    },
    removeTodo(todo) {
      this.todos.splice(this.todos.indexOf(todo), 1)
    },
    editTodo(todo) {
      this.beforeEditCache = todo.title;
      this.editedTodo = todo;
    },
    doneEdit(todo) {
      this.todos.forEach(value => {
        value.completed = true;
      })
    },
    cancelEdit(todo) {
      this.editedTodo = null;
      todo.title = this.beforeEditCache;
    },
    removeCompleted() {
      this.todos = filters.active(this.todos);
    }
  },
  methd: {
    display() {
      return this.todos.length > 0 ? 'block' : 'none';
    },
    completed(todo) {
      return todo.completed ? 'completed' : '';
    }
  }
});
