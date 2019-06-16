var STORAGE_KEY = new Date().getTime();
var todoStorage = {
  fetch() {
    var todos = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    todos.forEach(function (todo, index) { todo.id = index });
    todoStorage.uid = todos.length;
    return todos;
  },
  save(todos) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  }
}

var filters = {
  all(todos) {
    return todos;
  },
  active(todos) {
    return todos.filter(function (todo) {
      return !todo.completed;
    })
  },
  completed(todos) {
    return todos.filter(function (todo) {
      return todo.completed;
    })
  }
}

var app = new View({
  view: "body",
  model: {
    todos: todoStorage.fetch(),
    newTodo: "",
    editedTodo: null,
    visibility: "all"
  },
  action: {
    addTodo() {
      var value = this.newTodo && this.newTodo.trim();
      if (!value) return;
      this.todos.push({ id: todoStorage.uid++, title: value, completed: false });
      this.newTodo = "";
    },
    removeTodo(todo) {
      this.todos.splice(this.todos.indexOf(todo), 1);
    },
    editTodo(todo) {
      this.beforeEditCache = todo.title;
      this.editedTodo = todo;
    },
    doneEdit(todo) {
      if (!this.editedTodo) return;
      this.editedTodo = null;
      todo.title = todo.title.trim();
      if (!todo.title) this.removeTodo(todo);
    },
    cancelEdit(todo) {
      this.editedTodo = null;
      todo.title = this.beforeEditCache;
    },
    removeCompleted() {
      this.todos = filters.active(this.todos);
    }
  },
  filter: {
    filteredTodos() {
      return filters[this.visibility](this.todos);
    },
    remaining() {
      return filters.active(this.todos).length;
    },
    pluralize(n) {
      return n === 1 ? "item" : "items";
    },
    display() {
      return this.todos.length ? "block" : "none";
    },
    visiClass(value) {
      return this.visibility == value ? "selected" : "";
    },
    allDone: {
      get() {
        return this.remaining === 0;
      },
      set(value) {
        this.todos.forEach(function (todo) {
          todo.completed = value;
        });
      }
    }
  },
  watch: {
    todos(todos) {
      todoStorage.save(todos);
    }
  },
})

function onHashChange() {
  var visibility = window.location.hash.replace(/#\/?/, "");
  if (filters[visibility]) {
    app.model.visibility = visibility;
  } else {
    window.location.hash = "";
    app.model.visibility = "all";
  }
}

window.addEventListener('hashchange', onHashChange)
onHashChange();