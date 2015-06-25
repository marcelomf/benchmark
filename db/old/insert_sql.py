#!/usr/bin/python

import csv, sqlalchemy, json
from sqlalchemy import *

#db = create_engine('mysql://root@localhost/see')
db = create_engine('postgresql+psycopg2://postgres@localhost/see')
db.echo = False
metadata = MetaData(db)

flowt = Table('flow', metadata,
    Column('id', BigInteger, primary_key=True),
    Column('timestamp', Integer),
    Column('router', String(10)),
    Column('ip_src', String(16)),
    Column('ip_dst', String(16)),
    Column('proto', String(10)),
    Column('port_src', Integer),
    Column('port_dst', Integer),
    Column('bsize', Integer)
)

flowt.create()
i = flowt.insert()

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
      i.execute(packetKey)
