var fs=require('fs');
console.log('Press any key to exit');
var dt=null;
process.stdin.on('data', function(c) {

  if (c.toString().trim() == 'r') {
      console.log("start reading. "+process.memoryUsage().rss);
    fs.readFile(require.resolve('./yatto.json'), function(err,data){
        console.log('end reading. '+process.memoryUsage().rss);
        dt=data;
      });

  }
  if (c.toString().trim() == 'p') {
      console.log("parsing");
    var json=JSON.parse(dt);
    console.log('end reading. '+process.memoryUsage().rss);

  }
});
