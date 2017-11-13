# view.js web mvvm framework

版本：2.9.0

特点：   

    小而美，无复杂的指令，模板既html代码，无违和感自然便于维护

功能：  

    1.支持小粒度的表达式控制  

    2.基于浏览器解析（非字符串拼接）的模板引擎  

    3.循环嵌套  

    4.逻辑判断  

    5.数据双向绑定   

    6.兼容jQuery

指令：

     循环 @each( 变量：主键: 数组||对象 ,{  
              你的业务逻辑   
          })   

          有内联关系的标签如：table > tbody > tr > td之间无法写文本的请用下面指令替代，适用一切标签之间

          <!@each( 变量：主键: 数组||对象 ,{>
               你的业务逻辑
          <!})>

          或者   

          <div each="item:key:list">   
             {{key + item}}  
          </li>   

          说明： :主键 可忽略，"key"为关键字是迭代的索引。

     条件 @when( 布尔表达式 ,{   
              你的业务逻辑
              @else
              你的业务逻辑
          })

          或者   

          <!@when( 布尔表达式 ,{>   
              你的业务逻辑
              <!@else>
              你的业务逻辑
          <!})>
示例：  
  js   ：   

        new view({
            view:"body"
            model:{
               massage ： "输入点什么？"
               list :[1,2]，
               ul :[{
                 a:1,
                 b:2
               }]
            }
        });   

  html ：    

        @when(true,{   
            @each(item:id:list,{  
                <div id="{{id}}">  
                    {{item}}  
                </div>   
            })
            @else
            <ul>   
                <li each="li:ul">   
                {{li.a + li.b}}   
                </li>   
            </ul>   
        })   
        <div>{{name}}</div>    
        <input type="text" value="{{name}}">    
  完整示例：   

        <!DOCTYPE html>
        <html>

        <head>
            <title>sense-index</title>
            <script type="text/javascript" src="../view.js"></script>
            <script type="text/javascript">  
                $(function () {
                    new view({
                        view: "body",
                        model: {
                            massage: "输入点什么？",
                            list: [1, 2],
                            ul: [{
                                a: 1,
                                b: 2
                            }]
                        }
                    });
                })   
            </script>
        </head>

        <body>
            @each(item:list,{ 
                @when(true,{
                    <ul>
                        <li each="li:ul">
                            {{li.a + li.b}}
                        </li>
                    </ul>
                }) 
            })
            <div>{{massage}}</div>
            <input type="text" value="{{massage}}">
        </body>

        </html>  

说明：  

         目前是第二个版本，主体功能已经稳定，其他功能逐步完善，可以尝开发；如想试玩可直接拷贝test.html
         项目初期文档简陋但已够用，欢迎提交bug，和提出改进意见。我相信view会成为前端手中的倚天剑。

日志：
    
           2017.11.13
    2.9.0: 添加{{> }}指令，使其支持html模板的插入
           优化性能；对比vue.js，在大批1W数据下量迭代运算，使其性能接近vue.js的表现

           2017.10.5
    2.8.0: 代码重构，重写了模板引擎，完成了数据双向帮绑定，以前支持不整的部分，优化了整体性能，算是完全重造
           使其迭代支持自定义主键
           完整的数据双向绑定

           2016.7.25    
    1.3.1: 添加@else指令
           使其支持
           @when( 布尔表达式 ,{   
              你的业务逻辑
              @else
              你的业务逻辑
           })

           2015.9.30
    1.3.0: 性能改进10000条 div 生成性能接近jQuery ；jQuery 6.13s ，view 6.71s      

           2015.9.28
    1.2.0：添加新的指令解析方式，由于 table > tbody > tr > td 无法写文本，导致他们之间的 @each 指令没法正确
    解析修正为
           <!@each( 变量：数组||对象 ,{>
                你的业务逻辑
           <!})>
    没有内联关系的标签   
           @each( 变量：数组||对象 ,{    
              你的业务逻辑   
           })   
           和  
           <!@each( 变量：数组||对象 ,{>   
                你的业务逻辑  
           <!})>    
    两者都适用
