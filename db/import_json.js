var fs = require("fs"),
    path = require("path"),
    Data = require("./data"),
    StringDecoder = require('string_decoder').StringDecoder,
    schema_full = {};

var ImportJson = function(params, callbackImport) {
  var data;
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

  document = { efd: null };
  var file_data = fs.readFileSync(params.file);
  document.efd = JSON.parse(file_data.toString("utf8"));
  //console.log(document.efd['0150']);
  for(var b in document.efd) {
    console.log(b);
    for(var r in document.efd[b]) {
      console.log("  "+r);
      console.log("    "+JSON.stringify(document.efd[b][r]));
    }
  }
  data = Data;


/*    try_number = new Number(t);
    if(!isNaN(try_number) && t.length <= 10)
      data[sanitize_tag] = new Number(t);
    else if(m = t.match(/^(\d{4})-(\d{1,2})-(\d{1,2}).(\d{1,2}):(\d{1,2}):(\d{1,2})$/))
      data[sanitize_tag] = (m) ? new Date(m[1] , m[2]-1, m[3], m[4], m[5], m[6]) : new String(t);
    else if(m = t.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/))
      data[sanitize_tag] = (m) ? new Date(m[1] , m[2]-1, m[3]) : new String(t);
    else
      data[sanitize_tag] = new String(t);
*/

  function callbackSaveSync(err, resultData) {
    if(err) {
      result.TOTAL_REGISTER_ERROR+=1;
      console.error("Error: "+err);
    } else {
      result.TOTAL_REGISTER_ENDED+=1;
    }
    
    result.schema = data.generateSchema("orm", data);
    
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
}

module.exports = exports = ImportJson;
