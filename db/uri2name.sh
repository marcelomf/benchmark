#!/bin/bash
uri=$1
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
echo $container_name
