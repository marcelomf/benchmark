var orm = require("orm");
var Sequelize = require("sequelize");
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var elasticsearch = require('elasticsearch');
var elastic = new elasticsearch.Client();
//var loopback-datasource-juggler = require("loopback-datasource-juggler");
//var jugglingdb = require("jugglingdb");
//var bookshelf = require("bookshelf");
//var caminte = require("caminte");

var Nfe, nfe_schema, uri;

var bypass_data = /xml_data|sequelizeSave|ormSave|toObject|generateSchema|mongooseSave|syncSchema|elasticSave|uri/g;

var NfeData = {
  xml_data: null,
  toObject: function() {
    var object = {};
    Object.keys(NfeData).forEach(function(key, index) {
      if(key.match(bypass_data)) return; 
      object[key] = this[key];
    }, NfeData);
    return JSON.parse(JSON.stringify(object));
  }
}

var syncSchema = function(options, callback) {
  if(options.type == "sequelize") {
    var sequelize = new Sequelize(uri, { logging: false });
    var Nfe = sequelize.define('nfe_sequelize', options.schema, {
      freezeTableName: true // Model tableName will be the same as the model name
    });

    Nfe.sync({force: true})
    .then(function(){
      console.log("Table created sequelize.");
      callback();
    }, function(err){ 
      console.log(err);
      callback();
    });

  } else if(options.type == "orm") {
    orm.connect(uri, function (err, db) {
      if (err) { console.log(err); callback(); }
      db.settings.set('instance.returnAllErrors', true);
      var Nfe = db.define("nfe_orm", options.schema); 
      db.sync(function(err) { 
        if(err) console.log(err);
        console.log("Table created orm.");
        callback();
      });       
    });
  } else {
    console.log("Error: invalid options.type of syncSchema "+options.type);
    callback();
  }
}

var generateSchema = function(schemaType) {
  var nfe_schema = {};
  if(schemaType == "sequelize") {
    datetype = Sequelize.DATE; // ONLYDATE
    doubletype = Sequelize.DOUBLE;
    integertype = Sequelize.INTEGER;
    stringtype = Sequelize.STRING;
  } else if(schemaType.match(/orm/g)) {
    datetype = Date;
    doubletype = Number;
    integertype = Number;
    stringtype = String;
  } else if(schemaType.match(/mongoose/g)) {
    datetype = String;
    doubletype = String;
    integertype = String;
    stringtype = String;
  } else { return null; }

  Object.keys(NfeData).forEach(function(key, index) {
    if(key.match(bypass_data)) return;       
    
    if(this[key] instanceof Date)
      nfe_schema[key] = datetype; // ONLYDATE
    else if(!isNaN(this[key]) && this[key].toString().indexOf('.') != -1 && this[key].toString().length <= 10)
      nfe_schema[key] = doubletype;
    else if(!isNaN(this[key]) && this[key].toString().length <= 10)
      nfe_schema[key] = integertype
    else
      nfe_schema[key] = stringtype
  }, NfeData);

  return nfe_schema;
}

var sequelizeSave = function (callback){
  var sequelize = new Sequelize(NfeData.uri, { logging: false });
  var nfe_schema = generateSchema("sequelize");
  
  var Nfe = sequelize.define('nfe_sequelize', nfe_schema, {
    freezeTableName: true // Model tableName will be the same as the model name
  });

  Nfe.sync()
  .then(function(){
    // Table created
    //console.log(NfeData.toObject());
    Nfe.create(NfeData.toObject())
    .then(function(data) {
      return callback(null, data)
    });
  }, function(err){ return callback(err); });
}

var ormSave = function(callback) { 
  function setup(db, callback){
    var nfe_schema = generateSchema("orm");
    var Nfe = db.define("nfe_orm", nfe_schema);
    
    db.sync(function(err) { 
      if(err) return callback(err);
      Nfe.create(NfeData.toObject(), function(err) {
        db.close();
        db = null;
        if (err) return callback(err);
        else return callback(null, {});
      });
    });       
  }

  orm.connect(NfeData.uri, function (err, db) {
    if (err) return callback(err);
    db.settings.set('instance.returnAllErrors', true);
    setup(db, callback);
  });
}

var mongooseSave = function(callback) {
  nfe_schema = generateSchema("mongoose");
  if(!Nfe) Nfe = mongoose.model('Nfe', nfe_schema);
  var nfe = new Nfe(NfeData.toObject());
  nfe.save(function(err){
    if(err) return callback(err);
    else return callback(null, nfe);
  });
}

var elasticSave = function(callback) {
  /*elastic.cluster.health(function (err, resp) {
    if (err) console.error(err.message);
    else console.dir(resp);
  });*/
 
  elastic.index({
    index: "erp",
    type: "nfe",
    //id: NfeData['nfeProc_protNFe_infProt_chNFe'],
    body: NfeData.toObject()
  }, function(err, res) {
    if(err) return callback(err);
    else return callback(null, res);
  });
}

module.exports = exports = NfeData;
module.exports.generateSchema = exports.generateSchema = generateSchema;
module.exports.syncSchema = exports.syncSchema = syncSchema;
module.exports.sequelizeSave = exports.sequelizeSave = sequelizeSave;
module.exports.ormSave = exports.ormSave = ormSave;
module.exports.mongooseSave = exports.mongooseSave = mongooseSave;
module.exports.elasticSave = exports.elasticSave = elasticSave;
module.exports.uri = exports.uri = uri;
