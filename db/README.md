### Databases Benchmark
Clone repo and entry dir:
`git clone https://github.com/marcelomf/benchmark`
'cd benchmark/db'
Create docker containers:
`./build_env.sh`
Create your uri.txt file with password of databases(see the password with docker logs command):
`vim|nano|joe uri.txt`
Run your benchmark:
`./benchmark.sh [xml|csv] [directory|file] > benchmark.log 2>&1`
Grep your log and generate statistics csv:
`./grep_log.sh benchmark.log`
