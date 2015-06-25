#!/bin/bash
# "mongodb://admin:2KJYGXRliE51@127.0.0.1:27017/erp
dbs=( "elastic" "mongodb://127.0.0.1:27017/erp" "postgres://postgres:xrrNQ0kFtXfk@127.0.0.1:5432/erp" "mysql://admin:xdRrgDz6rg1v@127.0.0.1:3366/erp" )
file_dir=$1

for db in "${dbs[@]}"
do
  log=$(echo $db | sed -e "s/:\/\//_/g" -e "s/:/_/g" -e "s/\//_/g" -e "s/@/_/g")"_$file_dir"
  echo "INIT: $log"
  time node import_nfe.js $db $file_dir
done
