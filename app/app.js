var express = require('express');
var app = express();
var fs = require("fs");

app.use(express.static(__dirname + '/resources'));
app.use(express.static(__dirname + '/view'));

var chapters = [];
fs.readdir(__dirname + "/view/chapters", function (err, files) {
  if (err)
    return console.error(err);
  files.forEach(function (file) {
    var data = fs.readFileSync(__dirname + "/view/chapters/" + file);
    chapters.push(data.toString());
  });
});

app.get('/chapters/json', function (req, res) {
  res.send(chapters);
})
app.get('/', function (req, res) {
  res.sendFile(__dirname + "/view.1.html");
})

var server = app.listen(80, function () {

  var host = server.address().address
  var port = server.address().port

  console.log("应用实例，访问地址为 http://%s:%s", host, port)

})
