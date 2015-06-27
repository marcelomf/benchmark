#!/usr/bin/env node
var fs = require("fs"),
    path = require("path"),
    sax = require("sax"),
    Nfe = require("./nfe");

Nfe.uri = process.argv[2];
if(Nfe.uri.match(/^mariadb|percona/g))
  Nfe.uri = Nfe.uri.replace(/mariadb/g, "mysql")

var file_dir = process.argv[3];
var mode = process.argv[4];

var TOTAL_FILES = 0;
var TOTAL_FILES_ENDED = 0;
var TOTAL_FILES_STARTED = 0;
var TOTAL_FILES_ERROR = 0;
var MAX_CONCURRENCY = 16;
var schema_full = {};

var runStream = function(file) {
  var nfe;
  var full_tag = null;
  var tag = null;
  var attrs;
  var text;
  var isRef = false;
  var ref = {};

  TOTAL_FILES_STARTED += 1;

  var file_data = fs.readFileSync(file);
  var saxStream = sax.createStream(true, false);

  saxStream.on("error", function(e){
    console.error("Parser Error: ", e);
    this._parser.error = null;
    this._parser.resume();
    nfe = Nfe;
  });

  saxStream.on("opentag", function(node){
    tag = node.name;
    if(!full_tag){
      full_tag = tag;
      nfe = Nfe;
      nfe['xml_data'] = file_data;
    } else {
      full_tag += ">"+tag;
    }
    attrs = node.attributes;
    //console.log("OPEN TAG: "+full_tag);
  });

  saxStream.on("text", function(t){
    if(!full_tag || t == '' || t == '\r\n' || t == '\n')
      return;

    if(full_tag.indexOf("nfeProc>NFe>infNFe>det") === 0)
      return;

    sanitize_tag = full_tag;

    sanitize_tag = sanitize_tag.replace(/>/g, "_");
    try_number = new Number(t);
    if(!isNaN(try_number) && t.length <= 10)
      nfe[sanitize_tag] = new Number(t);
    else if(m = t.match(/^(\d{4})-(\d{1,2})-(\d{1,2}).(\d{1,2}):(\d{1,2}):(\d{1,2})$/))
      nfe[sanitize_tag] = (m) ? new Date(m[1] , m[2]-1, m[3], m[4], m[5], m[6]) : new String(t);
    else if(m = t.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/))
      nfe[sanitize_tag] = (m) ? new Date(m[1] , m[2]-1, m[3]) : new String(t);
    else
      nfe[sanitize_tag] = new String(t);
  });

  saxStream.on("closetag", function(name){
    //console.log("CLOSE TAG: "+full_tag);
    if(full_tag.indexOf(">"+name) >= 0)
      full_tag = full_tag.replace(new RegExp(">"+name+"$", "i"), "");
    else  
      full_tag = full_tag.replace(new RegExp(name+"$", "i"), "");
    
    if(name == 'nfeProc') {
      console.log("Saving: "+file+" - "+TOTAL_FILES_STARTED);
      //console.log(nfe);
      callback = function(err, nfe) {
        if(err) console.log("Error: "+err+" - "+(TOTAL_FILES_ERROR+=1));
        else console.log("Saved: "+file);
        TOTAL_FILES_ENDED += 1;
        if(TOTAL_FILES_ENDED+TOTAL_FILES_ERROR >= TOTAL_FILES) {
          console.log("TOTAL_FILES_ENDED: "+TOTAL_FILES_ENDED);
          console.log("TOTAL_FILES_ERROR: "+TOTAL_FILES_ERROR);
          if(mode == "sync") {
            if(Nfe.uri.match(/^mysql|postgres|sqlite|mongo/g))
              Nfe.syncSchema({type: "orm", schema: schema_full}, function(){ process.exit(0); });
            else if(Nfe.uri.match(/^elastic/g))
              process.exit(0);
            else process.exit(0);
            //else if(Nfe.uri.match(/^mongo/g))
              //Nfe.mongooseSave(callback);
          } else process.exit(0);
        }
      }

      if(mode == "sync") {
        var schema_current = Nfe.generateSchema("orm");
        for (var field in schema_current) { schema_full[field] = schema_current[field]; }
        callback(null, {});
      } else {
        if(Nfe.uri.match(/^mysql|postgres|sqlite|mongo/g))
          Nfe.ormSave(callback);
        else if(Nfe.uri.match(/^elastic/g))
          Nfe.elasticSave(callback);
        else callback(null, {});
        //else if(Nfe.uri.match(/^mongo/g))
          //Nfe.mongooseSave(callback);
      }
    }
  });

  saxStream.on("end", function(){
    //console.log("Stream_ended: "+file);
    //process.exit(0);
  });
  
  fs.createReadStream(file).pipe(saxStream);  
}

process.setMaxListeners(0);

if(fs.lstatSync(file_dir).isDirectory()) {
  fs.readdir(file_dir, function(err, files){
    TOTAL_FILES = files.length;
    console.log("TOTAL_FILES: "+TOTAL_FILES);
    var idInterval;
    files.forEach(function(file){ 
      if((TOTAL_FILES_STARTED - TOTAL_FILES_ENDED) >= MAX_CONCURRENCY) {
        idInterval = setInterval(function(idInterval){
          if((TOTAL_FILES_STARTED - TOTAL_FILES_ENDED) <= MAX_CONCURRENCY) {
            new runStream(path.join(file_dir, file));
            clearInterval(idInterval);
          }
        }, 300);
      } else {
        new runStream(path.join(file_dir, file));
        //(function(file_full){ new runStream(file_full); })(path.join(file_dir, file));
      }
    });
  });
} else {
  TOTAL_FILES = 1;
  console.log("TOTAL_FILES: "+TOTAL_FILES);
  new runStream(file_dir);
}
