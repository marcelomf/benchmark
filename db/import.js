#!/usr/bin/env node
var fs = require("fs"),
    path = require("path"),
    ixml = require("./import_xml"),
    icsv = require("./import_csv"),
    ijson = require("./import_json"),
    ixmljson = require("./import_xml_json"),
    data = require("./data");

var type = process.argv[2];
var uri = process.argv[3]; // 1
if(uri.match(/^mariadb|percona|mysqljson/g))
  uri = uri.replace(/mariadb/g, "mysql")

var file_dir = process.argv[4];
var mode = "";
if(process.argv[5])
  mode = process.argv[5]; // sync?

var TOTAL_REGISTER = 0;
var TOTAL_REGISTER_ENDED = 0;
var TOTAL_REGISTER_STARTED = 0;
var TOTAL_REGISTER_ERROR = 0;
var MAX_CONCURRENCY = 500;
var schema_full = {};
var POOL = [];

process.setMaxListeners(0);

var callbackImport = function(err, result) {
  if(err) {
    console.error("Error: "+result.params.file+" - "+err);
    TOTAL_REGISTER_ERROR+=1;
    return;
  } else {
    TOTAL_REGISTER_ENDED+=1;
  }
  //else console.log("Successful: import "+result.params.file);

  if(mode == "sync") {
    for (var field in result.schema) {
      if(!schema_full[field]) console.log("Add field: "+field+" "+result.params.file);
      schema_full[field] = result.schema[field]; 
    }
  }

  if(TOTAL_REGISTER_ENDED+TOTAL_REGISTER_ERROR >= TOTAL_REGISTER) {
    console.log("TOTAL_REGISTER_ENDED: "+TOTAL_REGISTER_ENDED);
    console.log("TOTAL_REGISTER_ERROR: "+TOTAL_REGISTER_ERROR);
    if(mode == "sync") {
      data.ormSync({uri: result.params.uri, schema: schema_full}, function(err, data){
        if(err) console.error("Error: sync "+result.params.file+" "+err);
        else console.log("Successful: sync "+result.params.file);
        //console.log(schema_full);
        process.exit(0);
      });
    } else process.exit(0);
  }
  return;
}

var Import = {
  run: function (file, uri, mode) {
    var params = {file: file, uri: uri, mode: mode, key_tag: "nfeProc"};
    if(fs.lstatSync(file).isDirectory()) console.log("Ignore "+file);
    else if(type == "xml") new ixml(params, callbackImport);
    else if(type == "csv") new icsv(params, callbackImport);
    else if(type == "json") new ijson(params, callbackImport);
    else if(type == "xml_json") new ixmljson(params, callbackImport);
    else callbackImport("Invalid import type("+type+").");
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
        //console.log((TOTAL_REGISTER_STARTED - (TOTAL_REGISTER_ENDED+TOTAL_REGISTER_ERROR))); 
        if(POOL.indexOf(path.join(file_dir, file) < 0)) {
          POOL.push(path.join(file_dir, file));
          idInterval = setInterval(function(idInterval){
            if((TOTAL_REGISTER_STARTED - (TOTAL_REGISTER_ENDED+TOTAL_REGISTER_ERROR)) <= MAX_CONCURRENCY) {
              TOTAL_REGISTER_STARTED += 1;
              //console.log(path.join(file_dir, file));
              Import.run(path.join(file_dir, file), uri, mode);
              clearInterval(idInterval);
              POOL.splice(POOL.indexOf(path.join(file_dir, file)), 1);
            }
          }, 300);
        } 
      } else {
        TOTAL_REGISTER_STARTED += 1;
        Import.run(path.join(file_dir, file), uri, mode);
      }
    });
  });
} else {
  TOTAL_REGISTER = 1;
  console.log("TOTAL_REGISTER: "+TOTAL_REGISTER);
  TOTAL_REGISTER_STARTED += 1;
  Import.run(file_dir, uri, mode);
}
