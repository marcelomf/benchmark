#!/usr/bin/env node
var fs = require("fs"),
    path = require("path"),
    ixml = require("./import_xml"),
    icsv = require("./import_csv"),
    Data = require("./data");

var type = process.argv[2];
var uri = process.argv[3]; // 1
if(uri.match(/^mariadb|percona/g))
  uri = uri.replace(/mariadb/g, "mysql")

var file_dir = process.argv[4];
var mode = process.argv[5]; // sync?

var TOTAL_FILES = 0;
var TOTAL_FILES_ENDED = 0;
var TOTAL_FILES_STARTED = 0;
var TOTAL_FILES_ERROR = 0;
var MAX_CONCURRENCY = 16;

process.setMaxListeners(0);

var callbackImport = function(err, result) {
  if(err) console.log("Error: import "+result.file+" "+result.uri+" "+err);
  else console.log("Successful: import "+result.file+" "+result.uri);
  
  TOTAL_FILES_ENDED += result.TOTAL_FILES_ENDED;
  TOTAL_FILES_ERROR += result.TOTAL_FILES_ERROR;
}

var Import = {
  run: function (file, uri) {
    if(type == "xml")
      new ixml({file: file, uri: uri}, callbackImport);
    else if(type == "csv")
      new icsv({file: file, uri: uri}, callbackImport);
    else
      console.log("Error: invalid import type("+type+").")
    TOTAL_FILES_STARTED += 1;
  }
}

if(fs.lstatSync(file_dir).isDirectory()) {
  fs.readdir(file_dir, function(err, files){
    TOTAL_FILES = files.length;
    console.log("TOTAL_FILES: "+TOTAL_FILES);
    var idInterval;
    files.forEach(function(file){ 
      if((TOTAL_FILES_STARTED - (TOTAL_FILES_ENDED+TOTAL_FILES_ERROR)) >= MAX_CONCURRENCY) {
        idInterval = setInterval(function(idInterval){
          if((TOTAL_FILES_STARTED - (TOTAL_FILES_ENDED+TOTAL_FILES_ERROR)) <= MAX_CONCURRENCY) {
            Import.run(path.join(file_dir, file), uri);
            clearInterval(idInterval);
          }
        }, 300);
      } else {
        Import.run(path.join(file_dir, file), uri);
      }
    });
  });
} else {
  TOTAL_FILES = 1;
  console.log("TOTAL_FILES: "+TOTAL_FILES);
  Import.run(file_dir, uri);
}
