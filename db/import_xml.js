#!/usr/bin/env node
var fs = require("fs"),
    path = require("path"),
    Data = require("./data"),
    sax = require("sax");

var TOTAL_FILES_ENDED = 0;
var TOTAL_FILES_STARTED = 0;
var TOTAL_FILES_ERROR = 0;

var Import = function(params, callback) {
  var data;
  var full_tag = null;
  var tag = null;
  var attrs;
  var text;
  var isRef = false;
  var ref = {};


  var file_data = fs.readFileSync(params.file);
  var saxStream = sax.createStream(true, false);

  saxStream.on("error", function(e){
    console.error("Parser Error: ", e);
    this._parser.error = null;
    this._parser.resume();
    data = Data;
    data.uri = params.uri;
  });

  saxStream.on("opentag", function(node){
    tag = node.name;
    if(!full_tag) {
      full_tag = tag;
      data = Data;
      data.uri = params.uri;
      data['xml'] = file_data;
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
      data[sanitize_tag] = new Number(t);
    else if(m = t.match(/^(\d{4})-(\d{1,2})-(\d{1,2}).(\d{1,2}):(\d{1,2}):(\d{1,2})$/))
      data[sanitize_tag] = (m) ? new Date(m[1] , m[2]-1, m[3], m[4], m[5], m[6]) : new String(t);
    else if(m = t.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/))
      data[sanitize_tag] = (m) ? new Date(m[1] , m[2]-1, m[3]) : new String(t);
    else
      data[sanitize_tag] = new String(t);
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
      callback = function(err, data) {
        if(err) console.error("Error: "+err+" - "+(TOTAL_FILES_ERROR+=1));
        else console.log("Saved: "+params.file);
        TOTAL_FILES_ENDED += 1;
        if(TOTAL_FILES_ENDED+TOTAL_FILES_ERROR >= TOTAL_FILES) {
          console.log("TOTAL_FILES_ENDED: "+TOTAL_FILES_ENDED);
          console.log("TOTAL_FILES_ERROR: "+TOTAL_FILES_ERROR);
          if(params.mode == "sync") {
            if(data.uri.match(/^mysql|postgres|sqlite|mongo/g))
              data.syncSchema({type: "orm", schema: schema_full}, function(){ process.exit(0); });
            else if(data.uri.match(/^elastic/g))
              process.exit(0);
            else process.exit(0);
            //else if(Data.uri.match(/^mongo/g))
              //Data.mongooseSave(callback);
          } else process.exit(0);
        }
      }

      if(params.mode == "sync") {
        var schema_current = Data.generateSchema("orm");
        for (var field in schema_current) { schema_full[field] = schema_current[field]; }
        callback(null, {});
      } else {
        if(data.uri.match(/^mysql|postgres|sqlite|mongo/g))
          data.ormSave(callback);
        else if(data.uri.match(/^elastic/g))
          data.elasticSave(callback);
        else callback(null, {});
        //else if(Data.uri.match(/^mongo/g))
          //Data.mongooseSave(callback);
      }
    }
  });

  saxStream.on("end", function(){
    //console.log("Stream_ended: "+file);
    //process.exit(0);
  });
  
  fs.createReadStream(params.file).pipe(saxStream);  
}

module.exports.Import = exports.Import = Import;
