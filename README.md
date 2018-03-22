## 简介
#####     viewjs是一个前端开发框架，通过数据驱动视图，可以方便的用于用户界面的开发。追求代码每一个字符的美感，经过多个版本的迭代重构功能已经稳定。小而美指令和HTML代码自然融合。

## 功能  
######     1.表达式    
######     3.数据双向绑定
######     4.循环 
######     5.逻辑 
######     6.事件
######     7.组件
######     8.路由

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
    
      <div each="item:i:list">
        @each(l:item){
          <div @click="alert(`{{param1}}`)">
            @when(i==1){
              <div id="{{i}}">{{param1}}</div>
            }.when(i==2){
              <div>{{param2}}</div>
            }.when{
              <div>{{l}}</div>
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
          list: [[1, 2],[3,4], [5,6]],
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
