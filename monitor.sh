#!/bin/bash 
# Based on Diego Lima source code https://twitter.com/diegolima
apt-get install -y sysstat > /dev/null
PROGS="node|php|python|go|java|rusk|haskell|ruby|Cpu|Mem|Swap|Tasks"
USERS="marcelo"
HDD="sda"
PORTS=":80|:443"
HOST="www.google.com"
OUTFILE=$1
> ${OUTFILE} 
while [ true ]; do 
  echo "=========================================================" >> ${OUTFILE} 
  echo "`date` - OPEN FILES - `lsof | cut -c40-47 | grep -v REG | wc -l`" >> ${OUTFILE} 
  nice -n -10 top -b -n2 -u $USERS | egrep -e $PROGS >> ${OUTFILE} 
  iostat -x -m 2 2 | grep $HDD | tail -5 >> ${OUTFILE} 
  echo "`date` - CON EST - `netstat -n | egrep -e $PORTS | grep ESTA | wc -l`" >> ${OUTFILE} 
  echo "`date` - CON TOTAL - `netstat -n | egrep -e $PORTS | wc -l`" >> ${OUTFILE} 
  ping -c 1 $HOST | egrep -e '.*bytes.*ms$' >> ${OUTFILE}
  echo "=========================================================" >> ${OUTFILE} 
  echo "" >> ${OUTFILE} 
  sleep 1 
done
