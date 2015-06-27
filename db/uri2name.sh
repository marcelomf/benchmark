#!/bin/bash
uri=$1
log=$(echo $uri | sed -e "s/:\/\//_/g" -e "s/:/_/g" -e "s/\//_/g" -e "s/@/_/g")
driver=$(echo $log | cut -d'_' -f1)
user=$(echo $log | cut -d'_' -f2)
pass=$(echo $log | cut -d'_' -f3)
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
  db="bench"
  if [ "$port" = "$driver" ]
  then
    container_name="$driver"
  else
    container_name="$driver"_"$port"
  fi
else
  container_name="$driver"_"$port"_"$db"
fi

case "$2" in
"-log")
  echo $log
  ;;
"-db")
  echo $db
  ;;
"-user")
  echo $user
  ;;
"-pass")
  echo $pass
  ;;
*)
  echo $container_name
  ;;
esac
