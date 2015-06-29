#!/usr/bin/env node
var fs = require("fs"),
    path = require("path"),
    csv = require("csv"),
    parse = require('csv-parse'),
    transform = require('stream-transform'),
    Data = require("./data");

var runStream = function(file) {
  var nfe;
  var output = [];
  
  TOTAL_FILES_STARTED += 1;

  //var file_data = fs.readFileSync(file);
  console.log(file);

  var parser = parse({delimiter: ';'});
  var csvStream = fs.createReadStream(file);
  var transformer = transform(function(record, callback){
    callback(null, record.join(' ')+'\n');
  }, {parallel: 10});

  csvStream.pipe(parser).pipe(transformer).pipe(process.stdout);
}
