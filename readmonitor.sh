#!/bin/bash
# Based on Diego Lima source code https://twitter.com/diegolima
PROGS="node|php|python|go|java|rusk|haskell|ruby|Cpu|Mem|Swap|Tasks"
USERS="marcelo"
HDD="sda"
INFILE=$1
echo ========= CPU =========== 
echo "Top CPU us%: `grep Cpu ${INFILE} | awk '{print $2}' | sort -n | tail -1`" 
echo "Top CPU sy%: `grep Cpu ${INFILE} | awk '{print $4}' | sort -n | tail -1`" 
echo "Top CPU wa%: `grep Cpu ${INFILE} | awk '{print $10}' | sort -n | tail -1`" 
echo ========= TOTAL MEMORY == 
echo "Top MEM used: `grep Mem: ${INFILE} | awk '{print $5}' | sort -n | tail -1`" 
echo "Top MEM free: `grep Mem: ${INFILE} | awk '{print $7}' | sort -n | tail -1`" 
echo "Top MEM buffer: `grep Mem: ${INFILE} | awk '{print $9}' | sort -n | tail -1`" 
echo ========= SWAP ========== 
echo "Top SWAP used: `grep Swap: ${INFILE} | awk '{print $5}' | sort -n | tail -1`" 
echo "Top SWAP free: `grep Swap: ${INFILE} | awk '{print $7}' | sort -n | tail -1`" 
echo "Top SWAP cache: `grep Swap: ${INFILE} | awk '{print $9}' | sort -n | tail -1`" 
echo ========= DISK ========== 
echo "Top Disk Write MB/s: `grep $HDD ${INFILE} | awk '{print $7}'| sort -n | tail -1`" 
echo "Top Disk Read MB/s: `grep $HDD ${INFILE} | awk '{print $6}' | sort -n | tail -1`" 
echo ====== Connections ====== 
echo "Top EST Con: `grep EST ${INFILE} | awk '{print $11}' | sort -n | tail -1`" 
echo "Top TOT Con: `grep TOTAL ${INFILE} | awk '{print $11}' | sort -n | tail -1`" 
echo "Top MAX MS: `egrep -e ".*bytes.*icmp.*time" ${INFILE} | awk '{print $7}' | cut -d'=' -f2 | sort -n | tail -1`"
echo "Top MIN MS: `egrep -e ".*bytes.*icmp.*time" ${INFILE} | awk '{print $7}' | cut -d'=' -f2 | sort -n | head -1`"
echo ========= MEMORY ======== 
echo "Top VIRT: `egrep -e $USERS ${INFILE} | awk '{print $5}' | sort -n | tail -1`"
echo "Top RES: `egrep -e $USERS ${INFILE} | awk '{print $6}' | sort -n | tail -1`"
echo "Top SHR: `egrep -e $USERS ${INFILE} | awk '{print $7}' | sort -n | tail -1`"
echo ===== OPEN FILES ========
echo "Top MAX Open: `grep OPEN ${INFILE} | awk '{print $11}' | sort -n | tail -1`" 
echo "Top MIN Open: `grep OPEN ${INFILE} | awk '{print $11}' | sort -n | head -1`" 
echo ===== TOP 5 CPU APPS ====
echo "`egrep -e $USERS ${INFILE} | awk '{print $9 " " $12" ("$1")"}' | sort -n | uniq | tail -5`"
echo ===== TOP 5 MEM APPS ====
echo "`egrep -e $USERS ${INFILE} | awk '{print $10 " " $12" ("$1")"}' | sort -n | uniq | tail -5`"
