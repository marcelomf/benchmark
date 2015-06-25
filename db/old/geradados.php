#!/usr/bin/php
<?php
// timestamp, router, ip src, ip dst, proto, port src, port dst, bsize 
$routers = array("cisco", "juniper", "linux", "freebsd", "openbsd");
$ips = array("192.168.0.1", "192.168.0.2", "192.168.0.3", "192.168.0.4", "192.168.0.5", "192.168.0.6", "200.123.321.2", "200.123.321.1");
$protos = array("udp", "tcp", "icmp");
$apps = array("22","80","21","8080","443");
//http://kb.juniper.net/InfoCenter/index?page=content&id=KB14737
const MTU_SIZE = 1500;
// 86400 == 1day/s 3600 == 1hr/s; 1488095 == max packets/s in 1GB
const PACKETS_COUNT = 89285700; // 1488095×60 

$i = 0;

function getRand($mixed)
{
	return $mixed[rand(0,(count($mixed)-1))];
}

for($i = 0; $i < PACKETS_COUNT; $i++)
{
	echo time()+rand(0, 60).",".getRand($routers).",".getRand($ips).",".getRand($ips).",".
			getRand($protos).",".getRand($apps).",".getRand($apps).",".rand(0, MTU_SIZE)."\n";
}

?>
