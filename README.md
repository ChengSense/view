## 简介
#####     viewjs是一个前端开发框架，通过数据驱动视图，可以方便的用于用户界面的开发。追求代码每一个字符的美感，经过多个版本的迭代重构功能已经稳定。小而美指令和HTML代码自然融合。

## 功能  
#####    插值，循环，逻辑，事件，数据双向绑定，组件，路由

## 文档  
#####    文档地址请访问 [viewjs.org](https://vewjs.github.io/viewjs.org/)

## 示例
    
```html
<!DOCTYPE html>
<html>

<head>
  <title>main.html</title>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  <script type="text/javascript" src="../../release/view.js"></script>
</head>

<body>

  <div @each="item:i:list">
    @each(l:item){
      <div @click="alert(param1)">
        @when(i==1){
          <div id="{i}">{param1}</div>
        }.when(i==2){
          <div>{param2}</div>
        }.when{
          <div>{l}</div>
        }
      </div>
    }
  </div>

</body>

</html>
<script type="text/javascript">
  var app = new View({
    view: "body",
    model: {
      router: "",
      list: [[1, 2],[3, 4], [5, 6]],
      param1: "param1",
      param2: "param2"
    },
    action: {
      alert(el) {
        app.model.param1 = "this.model";
      }
    }
  });
</script>
```

## 示例

```html
<!DOCTYPE html>
<html>

<head>
  <title>main.html</title>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  <script type="text/javascript" src="../../release/view.js"></script>
</head>

<body>
  <ul>
    <li>
      <a href="#home">home !</a>
    </li>
    <li>
      <a href="#detail/qwe/qwe">detail !</a>
    </li>
    <li>
      <a href="#edit/qwe/qwe">edit !</a>
    </li>
    <li>
      <input value="{param1}" /> + <input value="{param2}" />
    </li>
    <li>
      <home @id="router"></home>
    </li>
  </ul>
</body>

</html>
<script type="text/javascript">
  class Home {
    constructor() {
      this.view = 
      `<home>
        {name} => {param1+param2}
        <br>
        <input value="{name}" />
       </home>
      `;
      this.model = {
        name: "home"
      }
    }
  }

  class Detail {
    constructor() {
      this.view = 
      `<detail>
        {name} => {param1+param2}
        <br>
        <input value="{name}" />
       </detail>
      `;
      this.model = {
        name: "detail"
      }
    }
  }

  class Edit {
    constructor() {
      this.view = 
      `<edit>
        {name} => {param1+param2}
        <br>
        <input value="{name}" />
       </edit>
      `;
      this.model = {
        name: "edit"
      }
    }
  }

  var app = new View({
    view: "body",
    component: {
      Home, Detail, Edit
    },
    model: {
      param1: "",
      param2: ""
    }
  });

  new Router(app, {
    "home": {
      component: Home,
      router: "router",
      action: function (params) {

      }
    },
    "detail/:name/:id": {
      component: Detail,
      router: "router",
      action: function (params) {

      }
    },
    "edit/:name/:id": {
      component: Edit,
      router: "router",
      action: function (params) {

      }
    }
  });
</script>

```
