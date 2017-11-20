var express = require('express');
var app = express();

app.use(express.static(__dirname + '/resources'));
app.use(express.static(__dirname + '/view'));
app.use(express.static(__dirname + '/app'));

app.get('/', function (req, res) {
  res.sendFile(__dirname + "/index.html");
})

var server = app.listen(8081, function () {

  var host = server.address().address
  var port = server.address().port

  console.log("应用实例，访问地址为 http://%s:%s","127.0.0.1", port)

})
