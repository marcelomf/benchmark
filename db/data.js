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

var Register, data_schema, uri;

var bypass_data = /csv_data|xml_data|sequelizeSave|ormSave|toObject|generateSchema|mongooseSave|syncSchema|elasticSave|uri/g;

var Data = {
  csv: null,
  xml: null,
  json: null,
  toObject: function() {
    var object = {};
    Object.keys(Data).forEach(function(key, index) {
      if(key.match(bypass_data)) return; 
      object[key] = this[key];
    }, Data);
    return JSON.parse(JSON.stringify(object));
  }
}

var syncSchema = function(options, callback) {
  if(options.type == "sequelize") {
    var sequelize = new Sequelize(uri, { logging: false });
    Register = sequelize.define('data_sequelize', options.schema, {
      freezeTableName: true // Model tableName will be the same as the model name
    });

    Register.sync({force: true})
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
      var Register = db.define("data_orm", options.schema); 
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
  var data_schema = {};
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

  Object.keys(Data).forEach(function(key, index) {
    if(key.match(bypass_data)) return;       
    
    if(this[key] instanceof Date)
      data_schema[key] = datetype; // ONLYDATE
    else if(!isNaN(this[key]) && this[key].toString().indexOf('.') != -1 && this[key].toString().length <= 10)
      data_schema[key] = doubletype;
    else if(!isNaN(this[key]) && this[key].toString().length <= 10)
      data_schema[key] = integertype
    else
      data_schema[key] = stringtype
  }, Data);

  return data_schema;
}

var sequelizeSave = function (callback){
  var sequelize = new Sequelize(Data.uri, { logging: false });
  data_schema = generateSchema("sequelize");
  
  var Register = sequelize.define('data_sequelize', data_schema, {
    freezeTableName: true // Model tableName will be the same as the model name
  });

  Register.sync()
  .then(function(){
    // Table created
    Register.create(Data.toObject())
    .then(function(register) {
      return callback(null, register)
    });
  }, function(err){ return callback(err); });
}

var ormSave = function(callback) { 
  function setup(db, callback){
    data_schema = generateSchema("orm");
    var Register = db.define("data_orm", data_schema);
    
    db.sync(function(err) { 
      if(err) return callback(err);
      Register.create(Data.toObject(), function(err) {
        db.close();
        db = null;
        if (err) return callback(err);
        else return callback(null, {});
      });
    });       
  }

  orm.connect(Data.uri, function (err, db) {
    if (err) return callback(err);
    db.settings.set('instance.returnAllErrors', true);
    setup(db, callback);
  });
}

var mongooseSave = function(callback) {
  data_schema = generateSchema("mongoose");
  if(!Register) Register = mongoose.model('Data', data_schema);
  var register = new Register(Data.toObject());
  register.save(function(err){
    if(err) return callback(err);
    else return callback(null, register);
  });
}

var elasticSave = function(callback) {
  /*elastic.cluster.health(function (err, resp) {
    if (err) console.error(err.message);
    else console.dir(resp);
  });*/
 
  elastic.index({
    index: "bench",
    type: "register",
    body: Data.toObject()
  }, function(err, res) {
    if(err) return callback(err);
    else return callback(null, res);
  });
}

module.exports = exports = Data;
module.exports.generateSchema = exports.generateSchema = generateSchema;
module.exports.syncSchema = exports.syncSchema = syncSchema;
module.exports.sequelizeSave = exports.sequelizeSave = sequelizeSave;
module.exports.ormSave = exports.ormSave = ormSave;
module.exports.mongooseSave = exports.mongooseSave = mongooseSave;
module.exports.elasticSave = exports.elasticSave = elasticSave;
module.exports.uri = exports.uri = uri;
