#!/bin/bash
curl -sL https://deb.nodesource.com/setup_0.12 | bash -

apt-get update -y
apt-get install -y libmysqlclient-dev mongodb-clients mysql-client nodejs postgresql-client postgresql-server-dev-9.3 curl docker.io sudo

#curl -sL https://deb.nodesource.com/setup_iojs_1.x | sudo bash -
#apt-get install -y iojs

sudo npm update -g
sudo npm install -g bookshelf caminte elasticsearch mongodb mongoose mysql orm pg pg-hstore pg-native sax sequelize sequelize-cli sqlite3 tedious underscore-cli sql-query loopback-datasource-juggler loopback-connector-mongodb ya-csv fast-csv csv-streamify csv csv-parse stream-transform

db="bench"

docker run -d -p 5432:5432 --name postgres_5432_$db tutum/postgresql
docker logs postgres_5432_$db | head -n 30

docker run -d -p 3306:3306 --name mysql_3306_$db tutum/mysql
docker logs mysql_3306_$db | head -n 30

docker run -d -p 3366:3306 --name mariadb_3366_$db tutum/mariadb
docker logs mariadb_3366_$db | head -n 30

docker run -d -p 27017:27017 -p 28017:28017 -e AUTH=no --name mongodb_27017_$db tutum/mongodb
docker logs mongodb_27017_$db | grep "mongo admin"

docker run -d -p 9200:9200 --name elastic_9200_$db tutum/elasticsearch
docker logs elastic_9200_$db | head -n 30

docker run -d -p 5984:5984 --name couchdb_5984_$db tutum/couchdb
docker logs couchdb_5984_$db | head -n 30

docker run -d -p 8087:8087 -p 8098:8098 --name riak_8087_$db tutum/riak
docker logs riak_8087_$db | head -n 30

docker run -d -p 2424:2424 -p 2480:2480 --name orientdb_2424_$db joaodubas/orientdb
docker logs orientdb_2424_$db | head -n 30

docker run -d -p 8091:8091 --name couchbase_8091_$db couchbase/server
docker logs couchbase_8091_$db | head -n 30

docker run -d -p 7000:7000 --name cassandra_7000_$db cassandra
docker logs cassandra_7000_$db | head -n 30

docker run -d -p 8983:8983 --name solr_8983_$db makuk66/docker-solr
docker logs solr_8983_$db | head -n 30

docker run -d -p 8080:8080 --name hadoop_8080_$db sequenceiq/hadoop-docker
docker logs hadoop_8080_$db | head -n 30

docker run -d -p 5601:5601 --name kibana_5601_$db --link elastic:elasticsearch kibana
docker logs kibana_5601_$db | head -n 30

#docker pull devdb/kibana
