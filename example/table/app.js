let app = new View({
  view: "body",
  model: {
    todos: [],
    newTodo: "",
    editedTodo: null,
    visibility: "all"
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
      if (!this.editedTodo) return
      this.editedTodo = null;
      todo.title = todo.title.trim();
      if (!todo.title) {
        this.removeTodo(todo)
      }
    },
    cancelEdit(todo) {
      this.editedTodo = null;
      todo.title = this.beforeEditCache;
    },
    removeCompleted() {
      this.todos = filters.active(this.todos);
    }
  },
  watch: {
    visibility: function (val) {
      this.fullName = val + ' ' + this.lastName
    }
  }
});
