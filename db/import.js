#!/usr/bin/env node
var fs = require("fs"),
    path = require("path"),
    ixml = require("./import_xml"),
    icsv = require("./import_csv"),
    data = require("./data");

var type = process.argv[2];
var uri = process.argv[3]; // 1
if(uri.match(/^mariadb|percona/g))
  uri = uri.replace(/mariadb/g, "mysql")

var file_dir = process.argv[4];
var mode = "";
if(process.argv[5])
  mode = process.argv[5]; // sync?

var TOTAL_REGISTER = 0;
var TOTAL_REGISTER_ENDED = 0;
var TOTAL_REGISTER_STARTED = 0;
var TOTAL_REGISTER_ERROR = 0;
var MAX_CONCURRENCY = 16;
var schema_full = {};

process.setMaxListeners(0);

var callbackImport = function(err, result) {
  if(err) console.error("Error: import "+result.params.file+" "+err);
  else console.log("Successful: import "+result.params.file);
  TOTAL_REGISTER_ENDED += result.TOTAL_REGISTER_ENDED;
  TOTAL_REGISTER_ERROR += result.TOTAL_REGISTER_ERROR;

  if(result.params.mode == "sync") {
    for (var field in result.schema) { 
      schema_full[field] = result.schema[field]; 
    }
  }

  if(TOTAL_REGISTER_ENDED+TOTAL_REGISTER_ERROR >= TOTAL_REGISTER) {
    console.log("TOTAL_REGISTER_ENDED: "+TOTAL_REGISTER_ENDED);
    console.log("TOTAL_REGISTER_ERROR: "+TOTAL_REGISTER_ERROR);
    if(result.params.mode == "sync") {
      data.ormSync({uri: result.params.uri, schema: schema_full}, function(err, data){
        if(err) console.error("Error: sync "+result.params.file+" "+err);
        else console.log("Successful: sync "+result.params.file);
        process.exit(0);
      });
    } else process.exit(0);
  }
}

var Import = {
  run: function (file, uri, mode) {
    var params = {file: file, uri: uri, mode: mode, key_tag: "nfeProc"};
    if(type == "xml")
      new ixml(params, callbackImport);
    else if(type == "csv")
      new icsv(params, callbackImport);
    else
      console.error("Error: invalid import type("+type+").")
    TOTAL_REGISTER_STARTED += 1;
  }
}

if(fs.lstatSync(file_dir).isDirectory()) {
  fs.readdir(file_dir, function(err, files){
    TOTAL_REGISTER = files.length;
    console.log("TOTAL_REGISTER: "+TOTAL_REGISTER);
    var idInterval;
    files.forEach(function(file){
      // Manage concurrency
      if((TOTAL_REGISTER_STARTED - (TOTAL_REGISTER_ENDED+TOTAL_REGISTER_ERROR)) >= MAX_CONCURRENCY) {
        idInterval = setInterval(function(idInterval){
          if((TOTAL_REGISTER_STARTED - (TOTAL_REGISTER_ENDED+TOTAL_REGISTER_ERROR)) <= MAX_CONCURRENCY) {
            Import.run(path.join(file_dir, file), uri, mode);
            clearInterval(idInterval);
          }
        }, 300);
      } else {
        Import.run(path.join(file_dir, file), uri, mode);
      }
    });
  });
} else {
  TOTAL_REGISTER = 1;
  console.log("TOTAL_REGISTER: "+TOTAL_REGISTER);
  Import.run(file_dir, uri, mode);
}
