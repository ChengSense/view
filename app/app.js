var express = require('express');
var app = express();

app.use(express.static(__dirname + '/resources'));
app.use(express.static(__dirname + '/view'));

app.get('/', function (req, res) {
  res.sendFile(__dirname + "/view.1.html");
})

var server = app.listen(8081, function () {

  var host = server.address().address
  var port = server.address().port

  console.log("应用实例，访问地址为 http://%s:%s", host, port)

})
