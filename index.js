var express = require('express');
var app = express();
var request = require('request');
var parseString = require('xml2js').parseString;

var sys = require('sys')
var exec = require('child_process').exec;

app.post('/payload', function(req, res) {
  function puts(error, stdout, stderr) { sys.puts(stdout) }
  exec("sh /mnt/sda4/Scripts/pull.sh", puts);
  res.send("ok");
});

app.get("/test", function(req, res) {
  res.send("now it's the really new version");
})

app.get('/rss', function(req, res) {
  var sessionId;
  var options = {
    'method': 'GET',
    'url': 'http://192.168.1.1:9091/transmission/rpc',
    'auth': {
      'user': 'root',
      'pass': 'Ducktales1!',
      'sendImmediately': false
    }
  };
  request.get('http://192.168.1.1:9091/transmission/rpc', options,
  function(request, response, body) {
    options.headers = {};
    options.headers["X-Transmission-Session-Id"] = response.headers["x-transmission-session-id"];
    addTorrent();
  });
  var addTorrent = function() {
    options.method = 'POST';
    options.json = {
      "arguments": {
        "filename": ""
      },
      "method": "torrent-add"
    }
    request("http://showrss.info/user/117264.rss?magnets=true&namespaces=true&name=null&quality=null&re=null", function(zibi, response, body) {
      parseString(body, function(err, result) {
        result.rss.channel[0].item.forEach(function(item){
          if((new Date() - new Date(item.pubDate))/(3600*24*1000) < 1) {
            options.json.arguments["download-dir"] = "/mnt/sda4/Media/Series/" + item["tv:show_name"][0];
            options.json.arguments.filename = item.link[0];
            request(options);
          }
        })
      });
    })
  }
})


app.listen(3000);
