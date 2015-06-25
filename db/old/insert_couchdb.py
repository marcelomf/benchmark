#!/usr/bin/python

import csv, couchdb, json
client = couchdb.client.Server()
#db = client.see
flowdb = client.create('flow')

with open('flow_100000.csv', 'rb') as flowcsv:
   flow = csv.reader(flowcsv, delimiter=',', quotechar='|')
   packetList = []
   for packet in flow:
      packetKey = {}
      packetKey['timestamp'] = packet[0]
      packetKey['router'] = packet[1]
      packetKey['ip_src'] = packet[2]
      packetKey['ip_dst'] = packet[3]
      packetKey['proto'] = packet[4]
      packetKey['port_src'] = packet[5]
      packetKey['port_dst'] = packet[6]
      packetKey['bytes'] = packet[7]
      #packetList.append(packetKey)
      #print json.dumps(packetList)
      flowdb.save(packetKey)
