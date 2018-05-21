var express = require("express");
var app = express();

app.use(express.static(__dirname + '/portable/css'));
//Store all HTML files in view folder.
app.use(express.static(__dirname + '/portable/libs'));
app.use(express.static(__dirname + '/portable'));
//Store all JS and CSS in Scripts folder.


app.get("/", function(req, res) {
  //res.sendFile("portable/doc_uploader.html");
  //res.sendFile(__dirname + "portable/doc_uploader.html");
  res.sendFile(`${__dirname}/portable/doc_uploader.html`);
});

app.listen(3000, function() {
  console.log("Example app listening on port 3000!!!");
});
 