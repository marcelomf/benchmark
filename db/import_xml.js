var fs = require("fs"),
    path = require("path"),
    Data = require("./data"),
    sax = require("sax"),
    schema_full = {};

var ImportXml = function(params, callbackImport) {
  var data;
  var full_tag = null;
  var tag = null;
  var attrs;
  var text;
  var isRef = false;
  var ref = {};
  var result = {
    TOTAL_REGISTER: 1,
    TOTAL_REGISTER_STARTED: 0,
    TOTAL_REGISTER_ENDED: 0,
    TOTAL_REGISTER_ERROR: 0,
    params: params,
    data: [],
    schema: {}
  };

  var file_data = fs.readFileSync(params.file);
  var saxStream = sax.createStream(true, false);

  saxStream.on("error", function(e){
    console.error("Parser Error: ", e);
    this._parser.error = null;
    this._parser.resume();
    data = Data;
  });

  saxStream.on("opentag", function(node){
    tag = node.name;
    if(!full_tag) {
      full_tag = tag;
      data = Data;
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
    
    if(name == params.key_tag) {
      function callbackSaveSync(err, resultData) {
        if(err) {
          result.TOTAL_REGISTER_ERROR+=1;
          console.error("Error: "+err);
        } else {
          result.TOTAL_REGISTER_ENDED+=1;
        }
        
        result.schema = data.generateSchema("orm");
        
        if(result.TOTAL_REGISTER_ENDED+result.TOTAL_REGISTER_ERROR >= result.TOTAL_REGISTER) {
          result.data.push(resultData);
          callbackImport(null, result);
        }
      }

     
      if(params.uri.match(/^mysql|postgres|sqlite|mongo/g)) {
        if(params.mode == "sync") return callbackSaveSync(null, {}); // @FIXME We need fix it
        else return data.ormSave(params, callbackSaveSync);
      } else if(params.uri.match(/^elastic/g)) {
        if(params.mode == "sync") return callbackImport("Elastic dont be synced.", result);
        else return data.elasticSave(params, callbackSaveSync);
      } else return callbackImport("Invalid uri.", result);
      //else if(params.uri.match(/^mongo/g))
        //data.mongooseSave(params, callbackSaveSync);
    }
  });

  saxStream.on("end", function(){
    //console.log("Stream_ended: "+file);
    //process.exit(0);
  });
  
  fs.createReadStream(params.file).pipe(saxStream);  
}

module.exports = exports = ImportXml;
