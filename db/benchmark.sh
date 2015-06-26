#!/bin/bash
# "mongodb://admin:2KJYGXRliE51@127.0.0.1:27017/erp
#dbs=( "elastic" "mongodb://127.0.0.1:27017/erp" "postgres://postgres:xrrNQ0kFtXfk@127.0.0.1:5432/erp" "mysql://admin:xdRrgDz6rg1v@127.0.0.1:3366/erp" )
import_type=$1
file_dir=$2
uri_file="uri.txt"

#for db in "${dbs[@]}"
while IFS='' read -r uri || [[ -n $uri ]]
do
  log=$(echo $uri | sed -e "s/:\/\//_/g" -e "s/:/_/g" -e "s/\//_/g" -e "s/@/_/g")
  driver=$(echo $log | cut -d'_' -f1)
  port=$(echo $log | rev | cut -d'_' -f2 | rev)
  if [[ "$port" =~ ^[0-9]+$ ]]
  then
    db=$(echo $log | rev | cut -d'_' -f1 | rev)
  else
    port=$(echo $log | rev | cut -d'_' -f1 | rev)
    db="null"
  fi

  if [ "$db" = "null" ]
  then
    if [ "$port" = "$driver" ]
    then
      container_name="$driver"
    else
      container_name="$driver"_"$port"
    fi
  else
    container_name="$driver"_"$port"_"$db"
  fi
  echo "BEGIN: $container_name - $log - $uri_file - $(date)"
  docker start $container_name > /dev/null
  time node import_$import_type.js $uri $file_dir
  docker stop $container_name > /dev/null
  echo "ENDED: $container_name - $log - $uri_file - $(date)"
done < "$uri_file"
