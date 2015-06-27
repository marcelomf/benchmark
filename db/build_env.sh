#!/bin/bash

#curl -sL https://deb.nodesource.com/setup_iojs_1.x | sudo bash -
#apt-get install -y iojs

curl -sL https://deb.nodesource.com/setup_0.12 | bash -
apt-get update -y
apt-get install -y libmysqlclient-dev mongodb-clients mysql-client nodejs postgresql-client postgresql-server-dev-9.3 curl docker.io sudo
sudo npm update -g
sudo npm install -g bookshelf caminte elasticsearch mongodb mongoose mysql orm pg pg-hstore pg-native sax sequelize sequelize-cli sqlite3 tedious underscore-cli sql-query loopback-datasource-juggler loopback-connector-mongodb ya-csv fast-csv csv-streamify csv csv-parse stream-transform

db="bench"
uri_file="uri.txt"
images=$(mktemp)
cat << EOF > $images
5432:postgresql:tutum/postgresql
3306:mysql:tutum/mysql
3306:mariadb:tutum/mariadb
3306:percona:percona
27017:mongodb:tutum/mongodb
9200:elasticsearch:tutum/elasticsearch
5984:couchdb:tutum/couchdb
8098:riak:tutum/riak
2480:orientdb:joaodubas/orientdb
8091:couchbase:couchbase/server
7000:cassandra:cassandra
8983:solr:makuk66/docker-solr
8080:hadoop:sequenceiq/hadoop-docker
EOF

while IFS='' read -r uri || [[ -n $uri ]]
do
  container_name=$(./uri2name.sh $uri)
  driver=$(echo $container_name | cut -d'_' -f1)
  host_port=$(echo $container_name | cut -d'_' -f2)
  container_port=$(cat $images | grep $driver | cut -d':' -f1)
  image=$(cat $images | grep $driver | cut -d':' -f3)
  
  echo -e "----- UP CONTAINER: $container_name -----"
  if [ "$driver" = "mongodb"  ]
  then
    docker run -d -p 27017:27017 -p 28017:28017 -e AUTH=no --name mongodb_27017_$db tutum/mongodb
    sleep 3
    docker logs mongodb_27017_$db | head -n 30
    continue
  fi

  if [ "$driver" = "riak"  ]
  then
    docker run -d -p 8087:8087 -p 8098:8098 --name riak_8087_$db tutum/riak
    sleep 3
    docker logs riak_8087_$db | head -n 30
    continue
  fi

  if [ "$driver" = "orientdb"  ]
  then
    docker run -d -p 2424:2424 -p 2480:2480 --name orientdb_2424_$db joaodubas/orientdb
    sleep 3
    docker logs orientdb_2424_$db | head -n 30
    continue
  fi

  docker run -d -p $host_port:$container_port --name $container_name $image
  sleep 3
  docker logs $container_name | head -n 30

done < "$uri_file"

docker run -d -p 5601:5601 --name kibana_5601_$db --link elastic:elasticsearch kibana
docker logs kibana_5601_$db | head -n 30

#docker pull devdb/kibana
