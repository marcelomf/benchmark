#!/bin/bash
curl -sL https://deb.nodesource.com/setup_0.12 | bash -

apt-get update -y
apt-get install -y libmysqlclient-dev mongodb-clients mysql-client nodejs postgresql-client postgresql-server-dev-9.3 curl docker.io

#curl -sL https://deb.nodesource.com/setup_iojs_1.x | sudo bash -
#apt-get install -y iojs

npm update -g
npm install -g bookshelf caminte elasticsearch mongodb mongoose mysql orm pg pg-hstore pg-native sax sequelize sequelize-cli sqlite3 tedious underscore-cli sql-query loopback-datasource-juggler loopback-connector-mongodb

docker run -d -p 5432:5432 --name pg tutum/postgresql
docker logs pg | head -n 30
docker run -d -p 3306:3306 --name mysql tutum/mysql
docker logs mysql | head -n 30
docker run -d -p 3366:3306 --name mariadb tutum/mariadb
docker logs mariadb | head -n 30
docker run -d -p 27017:27017 -p 28017:28017 -e AUTH=no --name mongo tutum/mongodb
docker logs mongo | grep "mongo admin"
docker run -d -p 9200:9200 --name elastic tutum/elasticsearch
docker logs elastic | head -n 30
docker run -d -p 5984:5984 --name couchdb tutum/couchdb
docker logs couchdb | head -n 30
docker run -d -p 8087:8087 -p 8098:8098 --name riak tutum/riak
docker logs riak | head -n 30
docker run -d -p 2424:2424 -p 2480:2480 --name orientdb joaodubas/orientdb
docker logs orientdb | head -n 30
docker run -d -p 8091:8091 --name couchbase couchbase/server
docker logs couchbase | head -n 30
docker run -d -p 7000:7000 --name cassandra cassandra
docker logs cassandra | head -n 30
docker run -d -p 8983:8983 --name solr makuk66/docker-solr
docker logs solr | head -n 30
docker run -d -p 8080:8080 --name hadoop sequenceiq/hadoop-docker
docker logs hadoop | head -n 30
docker run -d -p 5601:5601 --name kibana --link elastic:elasticsearch kibana
docker logs kibana | head -n 30
#docker pull devdb/kibana
