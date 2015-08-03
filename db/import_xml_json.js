var fs = require("fs"),
    path = require("path"),
    parse = require("xml2js").parseString,
    Data = require("./data"),
    StringDecoder = require('string_decoder').StringDecoder,
    schema_full = {};

var ImportXmlJson = function(params, callbackImport) {
  var data;
  var ref = {};
  var result = {
    params: params,
    data: [],
    schema: {}
  };

  data = Data

  function save(err, xml){
    if(err) return callbackImport(err);
    parse(xml, function(err2, d){
      if(err2) return callbackImport(err2);
      d.nfeProc.NFe[0].Signature = [];
      params.json = d;
      data.mongooseSave(params, function(err3, result){
        if(err3) return callbackImport(er3);
        else return callbackImport(null, result);
        //console.log("Successful: "+result);
        //console.log(schema_full);
      });
    });
  }

  fs.readFile(params.file, save);
}

module.exports = exports = ImportXmlJson;
