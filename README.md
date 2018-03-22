## 简介
#####     viewjs是一个前端开发框架，通过数据驱动视图，可以方便的用于用户界面的开发。追求代码每一个字符的美感，经过多个版本的迭代重构功能已经稳定。小而美指令和HTML代码自然融合。

## 功能  
######     1.支持小粒度的表达式控制  
######     2.基于浏览器解析（非字符串拼接）的模板引擎  
######     3.循环嵌套  
######     4.逻辑判断  
######     5.数据双向绑定

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
        <div @click="alert(`{{param1}}`)">
          @when(i==1){
            {{param1}}
          }
          .when(i==2){
            {{item}}
          }
          .when{
            {{i}}
          }
        </div>
      </div>
    
    </body>
    
    </html>
    <script type="text/javascript">
      var app = new View({
        view: "body",
        model: {
          router: "",
          list: [1, 2, 3],
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
