var fs = require("fs"),
    path = require("path"),
    csv = require("ya-csv"),
    Nfe = require("./nfe");

Nfe.uri = process.argv[2];
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
  var output = [];
  
  TOTAL_FILES_STARTED += 1;

  //var file_data = fs.readFileSync(file);
  console.log(file);

  var reader = csv.createCsvFileReader(file, {columnsFromHeader:true, 'separator': ';'});

  reader.addListener('data', function(data){
    console.log(data);
  });

  reader.addListener('end', function(){
    console.log('thats it');
  });
}

process.setMaxListeners(0);

if(fs.lstatSync(file_dir).isDirectory()) {
  fs.readdir(file_dir, function(err, files){
    TOTAL_FILES = files.length;
    console.log("TOTAL_FILES: "+TOTAL_FILES);
    var idInterval;
    files.forEach(function(nfe_file){ 
      if((TOTAL_FILES_STARTED - TOTAL_FILES_ENDED) >= MAX_CONCURRENCY) {
        idInterval = setInterval(function(idInterval){
          if((TOTAL_FILES_STARTED - TOTAL_FILES_ENDED) <= MAX_CONCURRENCY) {
            new runStream(path.join(file_dir, file));
            clearInterval(idInterval);
          }
        }, 300);
      } else {
        new runStream(path.join(file_dir, file));
        //(function(file_full){ new runStream(nfe_file_full); })(path.join(file_dir, nfe_file));
      }
    });
  });
} else {
  TOTAL_FILES = 1;
  console.log("TOTAL_FILES: "+TOTAL_FILES);
  new runStream(file_dir);
}
