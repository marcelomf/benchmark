#!/bin/bash
import_type=$1
file_dir=$2
uri_file="uri.txt"

while IFS='' read -r uri || [[ -n $uri ]]
do
  container_name=$(./uri2name.sh $uri)
  echo "BEGIN: $container_name - $uri_file - $(date)"
  #sudo docker start $container_name > /dev/null
  time node import_$import_type.js $uri $file_dir
  #sudo docker stop $container_name > /dev/null
  echo "ENDED: $container_name - $uri_file - $(date)"
done < "$uri_file"
