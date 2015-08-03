var orm = require("orm");
var Sequelize = require("sequelize");
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var elasticsearch = require('elasticsearch');
//var loopback-datasource-juggler = require("loopback-datasource-juggler");
//var jugglingdb = require("jugglingdb");
//var bookshelf = require("bookshelf");
//var caminte = require("caminte");

var bypass_data = /json|csv|xml|sequelizeSave|ormSave|toObject|generateSchema|mongooseSave|elasticSave|ormSync/g;

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

var generateSchema = function(schemaType, data) {
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
    datetype = Date;
    doubletype = Number;
    integertype = Number;
    stringtype = String;
  } else { return null; }

  Object.keys(data).forEach(function(key, index) { 
    if(key.match(bypass_data)) return;

    if(this[key] instanceof Date)
      data_schema[key] = datetype; // ONLYDATE
    else if(!isNaN(this[key]) && this[key].toString().indexOf('.') != -1 && this[key].toString().length <= 10)
      data_schema[key] = doubletype;
    else if(!isNaN(this[key]) && this[key].toString().length <= 10)
      data_schema[key] = integertype
    else
      data_schema[key] = stringtype
  }, data);

  return data_schema;
}

var ormSync = function(params, callback) {
  function setup(db, params, callback){
    var Register = db.define("data_orm", params.schema);
    return db.sync(function(err) { 
      if(err) return callback(err);
      console.log("Table created orm.");
      return callback(null, {});
    });       
  }

  return orm.connect(params.uri, function (err, db) {
    if (err) return callback(err);
    db.settings.set('instance.returnAllErrors', true);
    return setup(db, params, callback);
  });
}

var ormSave = function(params, callback) { 
  function setup(db, callback){
    var data_schema = generateSchema("orm", Data);
    var Register = db.define("data_orm", data_schema);
    
    return db.sync(function(err) { 
      if(err) return callback(err);
      Register.create(Data.toObject(), function(err) {
        db.close();
        db = null;
        if (err) return callback(err);
        else return callback(null, {});
      });
    });       
  }

  return orm.connect(params.uri, function (err, db) {
    if (err) return callback(err);
    db.settings.set('instance.returnAllErrors', true);
    return setup(db, callback);
  });
}

var squelizeSync = function(params, callback) {
  var sequelize = new Sequelize(params.uri, { logging: false });
  var Register = sequelize.define('data_sequelize', params.schema, {
    freezeTableName: true // Model tableName will be the same as the model name
  });

  return Register.sync({force: true})
  .then(function(){
    console.log("Table sync sequelize.");
    return callback(null, {});
  }, function(err){ 
    return callback(err);
  });
}

var sequelizeSave = function(params, callback){
  var sequelize = new Sequelize(params.uri, { logging: false });
  var data_schema = generateSchema("sequelize", Data);
  
  var Register = sequelize.define('data_sequelize', data_schema, {
    freezeTableName: true // Model tableName will be the same as the model name
  });

  return Register.sync().then(function(){
    // Table created
    Register.create(Data.toObject())
    .then(function(register) {
      return callback(null, register)
    });
  }, function(err){ return callback(err); });
}

var dbs = new Array();
var last = 0;
var db = null;
function balance(){
  if(dbs.length >= 50) last = 0;
  else last +=1;
  if(dbs.indexOf(last) < 0) dbs[last] = {con: null};
  return dbs[last];
}

var schema = null;
var Register = null;
var mongooseSave = function(params, callback) {
  //var data_schema = generateSchema("mongoose", Data);
  if(db == null || db.connection.readyState == 0) {
    var options = {
      db: { native_parser: true },
      server: { poolSize: 5 },
      /*replset: { rs_name: 'myReplicaSetName' },
      user: 'myUserName',
      pass: 'myPassword'*/
    }
    db = require("mongoose");
    db.connect(params.uri, options);
    schema = new Schema({}, { strict: false });
  }
  Register = db.model('data_json', schema);
  var string = JSON.stringify(params.json)
                .replace(/\$/g,"xmlattrs")
                .replace(/("[0-9]+\.[0-9]+")/g, "REMOVEQUOTE$1REMOVEQUOTE")
                .replace(/("[1-9][0-9]{0,10}")/g, "REMOVEQUOTE$1REMOVEQUOTE")
                .replace(/REMOVEQUOTE"/g,"")
                .replace(/"REMOVEQUOTE/g,"");
  var register = new Register(JSON.parse(string));
  return register.save(function(err){
    if(err) return callback(err);
    else return callback(null, register);
  });
}

var elasticSave = function(params, callback) {
  var elastic = new elasticsearch.Client();
  var Register;
  /*elastic.cluster.health(function (err, resp) {
    if (err) console.error(err.message);
    else console.dir(resp);
  });*/
 
  return elastic.index({
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
module.exports.ormSync = exports.ormSync = ormSync;
module.exports.sequelizeSave = exports.sequelizeSave = sequelizeSave;
module.exports.ormSave = exports.ormSave = ormSave;
module.exports.mongooseSave = exports.mongooseSave = mongooseSave;
module.exports.elasticSave = exports.elasticSave = elasticSave;
