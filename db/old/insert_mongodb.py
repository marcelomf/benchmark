#!/usr/bin/python

import csv, pymongo, json
from pymongo import MongoClient

client = MongoClient()
db = client.see
flowdb = db.flow

with open('flow_1m.csv', 'rb') as flowcsv:
   flow = csv.reader(flowcsv, delimiter=',', quotechar='|')
   packetList = []
   for packet in flow:
      packetKey = {}
      packetKey['timestamp'] = int(packet[0])
      packetKey['router'] = packet[1]
      packetKey['ip_src'] = packet[2]
      packetKey['ip_dst'] = packet[3]
      packetKey['proto'] = packet[4]
      packetKey['port_src'] = int(packet[5])
      packetKey['port_dst'] = int(packet[6])
      packetKey['bsize'] = int(packet[7])
      #packetList.append(packetKey)
      #print json.dumps(packetList)
      flowdb.insert(packetKey)
