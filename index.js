var express = require("express");
var app = express();

app.get("/", function(req, res) {
  //res.sendFile("portable/doc_uploader.html");
  //res.sendFile(__dirname + "portable/doc_uploader.html");
  res.sendFile(`${__dirname}/portable/doc_uploader.html`);
});

app.listen(3000, function() {
  console.log("Example app listening on port 3000!");
});
 