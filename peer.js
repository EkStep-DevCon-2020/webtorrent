const express = require('express'),
    cookieParser = require('cookie-parser'),
    morgan = require('morgan'),
    bodyParser = require('body-parser'),
    port = 8081,
    compression = require('compression'),
    WebTorrent = require('webtorrent');

let request = require("request");
let btHost = '172.16.0.219';
let btPort = '8000';
let dhtPort = '20000';
let announceList = ['http://' + btHost + ':' + btPort, 'udp://' + btHost + ':' + btPort, 'ws://' + btHost + ':' + btPort];
let client = new WebTorrent({ dht: { bootstrap: btHost + ':' + dhtPort } });

client.on('torrent', function (torrent) {
    console.log("On Torrent", torrent.files[0].length);
})
client.on('error', function (err) {
    console.log("On Error", err);
})

function download(contentId) {
    request({ headers: { "content-type": "application/json" }, method: "GET", url: "http://" + btHost + ":8080/torrent/" + contentId }, (error, response, body) => {
        if (error || response.statusCode === 500 || response.statusCode === 401) {
            console.log('Error occured:', error);
        } else {
            let torrentInfo = JSON.parse(body);
            console.log('magneturi', torrentInfo.torrentId);
            client.add(torrentInfo.torrentId, { announce: announceList, path: './download' }, function (torrent) {
                torrent.on('done', function () {
                    console.log('torrent download finished')
                })
            })
        }
    });
}

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

    //compresses the angular bundle size further by using gzipped encoding for faster loading
    app.use(compression());

    app.get("/download/:contentId", (req, res) => {
        let contentId = req.params.contentId;
        download(contentId);
        res.json({ msg: "download initiated" })
    });
    module.exports = app;

    return app;
}
const app = createAppServer();
app.listen(port, () => console.log(`services is running in test env on port ${port} with ${process.pid} pid`));