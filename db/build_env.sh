#!/bin/bash

#curl -sL https://deb.nodesource.com/setup_iojs_1.x | sudo bash -
#apt-get install -y iojs

curl -sL https://deb.nodesource.com/setup_0.12 | bash -
apt-get update -y
apt-get install -y libmysqlclient-dev mongodb-clients mysql-client nodejs postgresql-client postgresql-server-dev-9.3 curl docker.io sudo make
sudo npm update -g
sudo npm install -g bookshelf caminte elasticsearch mongodb mongoose mysql orm pg pg-hstore pg-native sax sequelize sequelize-cli sqlite3 tedious underscore-cli sql-query loopback-datasource-juggler loopback-connector-mongodb ya-csv fast-csv csv-streamify csv csv-parse stream-transform

uri_file="uri.txt"
images=$(mktemp)
cat << EOF > $images
5432:postgresql:tutum/postgresql:POSTGRES_USER:POSTGRES_PASS
3306:mysql:tutum/mysql:MYSQL_USER:MYSQL_PASS
3306:mariadb:tutum/mariadb:MARIADB_USER:MARIADB_PASS
27017:mongodb:tutum/mongodb:MONGODB_USER:MONGODB_PASS
9200:elasticsearch:tutum/elasticsearch:ELASTICSEARCH_USER:ELASTICSEARCH_PASS
5984:couchdb:tutum/couchdb:COUCHDB_USER:COUCH_PASS
8098:riak:tutum/riak:RIAK_USER:RIAK_PASS
3306:percona:percona:MYSQL_ROOT:MYSQL_ROOT_PASSWORD
2480:orientdb:joaodubas/orientdb:ORIENTDB_ROOT:ORIENTDB_ROOT_PASSWORD
8091:couchbase:couchbase/server:NULL_USER:NULL_PASS
7000:cassandra:cassandra:NULL_USER:NULL_PASS
8983:solr:makuk66/docker-solr:NULL_USER:NULL_PASS
8080:hadoop:sequenceiq/hadoop-docker:NULL_USER:NULL_PASS
EOF

while IFS='' read -r uri || [[ -n $uri ]]
do
  container_name=$(./uri2name.sh $uri)
  db=$(./uri2name.sh $uri -db)
  user=$(./uri2name.sh $uri -user)
  pass=$(./uri2name.sh $uri -pass)
  driver=$(echo $container_name | cut -d'_' -f1)
  host_port=$(echo $container_name | cut -d'_' -f2)
  container_port=$(cat $images | grep $driver | cut -d':' -f1)
  image=$(cat $images | grep $driver | cut -d':' -f3)
  env_user=$(cat $images | grep $driver | cut -d':' -f4)
  env_pass=$(cat $images | grep $driver | cut -d':' -f5)

  if [ "$1" = "force" ]
  then
    echo -e "----- REMOVE CONTAINER: $container_name -"
    docker rm -f $container_name
  fi

  echo -e "----- UP CONTAINER: $container_name -----"
  case "$driver" in
  "mongodb")
    docker run -d -p 27017:27017 -p 28017:28017 -e AUTH=no --name mongodb_27017_$db tutum/mongodb
    ;;
  "riak")
    docker run -d -p 8087:8087 -p 8098:8098 -e $env_user=$user -e $env_pass=$pass --name riak_8087_$db tutum/riak
    ;;
  "orientdb")
    docker run -d -p 2424:2424 -p 2480:2480 -e $env_user=$user -e $env_pass=$pass --name orientdb_2424_$db joaodubas/orientdb
    ;;
  *)
    docker run -d -p $host_port:$container_port --name $container_name $image
    docker logs $container_name | head -n 30
    ;;
  esac
done < "$uri_file"

docker run -d -p 5601:5601 --name kibana_5601_bench --link elastic:elasticsearch kibana
docker logs kibana_5601_$db | head -n 30

#docker pull devdb/kibana
