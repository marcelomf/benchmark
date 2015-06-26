## Databases Benchmark

### Supported Databases
- postgres -> OK
- mysql -> OK
- mariadb -> OK
- mongodb -> OK
- elasticsearch -> OK
- sqlite -> OK
- couchdb -> Docker ok, but need nodejs code 
- riak-> Docker ok, but need nodejs code
- orientdb -> Docker ok, but need nodejs code
- couchbase -> Docker ok, but need nodejs code
- cassandra -> Docker ok, but need nodejs code
- solr -> Docker ok, but need nodejs code
- hadoop -> Docker ok, but need nodejs code
- arangodb -> Not ok
- scaledb -> Not ok
- iotdb -> Not ok
- memsql -> Not ok
- leveldb -> Not ok
- simpledb -> Not ok
- Research bigtable
- Research dremel BigQuery google
- Research influxdb
- Research fluentd
- Research logstash / splunk

### First steps
Clone repo and entry dir:

`git clone https://github.com/marcelomf/benchmark`

Entry your directory:

'cd benchmark/db'

Create docker containers:

`sudo ./build_env.sh`

Create your uri.txt file with password of databases(see the password with docker logs command):

`vim|nano|joe uri.txt`

Run your benchmark:

`sudo ./benchmark.sh [xml|csv] [directory|file] > benchmark.log 2>&1`

Grep your log and generate statistics csv:

`./grep_log.sh benchmark.log`
