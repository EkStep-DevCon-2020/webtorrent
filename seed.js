const express = require('express'),
    cookieParser = require('cookie-parser'),
    morgan = require('morgan'),
    bodyParser = require('body-parser'),
    port = 8080,
    compression = require('compression');
    ip = require('ip')
const WebTorrent = require('webtorrent');

//let client = new WebTorrent()
let torrents = {};

const createAppServer = () => {
    const app = express();

    app.use(function (req, res, next) {
        res.header("Access-Control-Allow-Origin", "*");
        next();
    })

    app.use(bodyParser.json({
        limit: '1mb'
    }));
    app.use(morgan("combined"));
    app.use(express.json());

    app.use(bodyParser.urlencoded({
        extended: false
    }));
    app.use(cookieParser());

    app.use(compression());

    app.get("/torrent/:contentId", (req, res) =>
        res.json({ torrentId: torrents[req.params.contentId] })
    );
    module.exports = app;

    return app;
}
const app = createAppServer();
app.listen(port, () => console.log(`services is running in test env on port ${port} with ${process.pid} pid`));

var DHT = require('bittorrent-dht')
var dht = new DHT()

dht.listen(20000, function () {
    let client = new WebTorrent({ nodeId: "1", dht: { bootstrap: 'localhost:20000' } })
    console.log('now listening')
    seedContent();
})

dht.on('peer', function (peer, infoHash, from) {
    console.log('found potential peer ' + peer.host + ':' + peer.port + ' through ' + from.address + ':' + from.port)
})

dht.on('error', function (err) {
    console.log('dht error', err);
})

dht.on('node', function (node) {
    console.log('dht node', node);
})
let contents = [
    {
        "id": "do_312531017984360448110344",
        "file": "./ecars/do_312531017984360448110344.ecar"
    },
    {
        "id": "do_312619534234542080213341",
        "file": "./ecars/do_312619534234542080213341.ecar"
    },
    {
        "id": "do_31270368492387532814779",
        "file": "./ecars/do_31270368492387532814779.ecar"
    },
    {
        "id": "do_31284795283451904011340",
        "file": "./ecars/do_31284795283451904011340.ecar"
    },
    {
        "id": "do_31242985055002624012123",
        "file": "./ecars/do_31242985055002624012123.ecar"
    },
    {
        "id": "do_3125105202928107522919",
        "file": "./ecars/do_3125105202928107522919.ecar"
    }
    
]


let btHost = ip.address();
let btPort = '8000';
let dhtPort = '20000';
let announceList = ['http://' + btHost + ':' + btPort, 'udp://' + btHost + ':' + btPort, 'ws://' + btHost + ':' + btPort];
console.log(`App runnig on ${btHost}`)
function seedContent() {
    let client = new WebTorrent({ dht: { bootstrap: btHost + ':' + dhtPort } })
    contents.forEach(function (content) {
        client.seed(content.file, { announce: announceList }, function (torrent) {
            torrents[content.id] = torrent.magnetURI;
        })
    })
}
