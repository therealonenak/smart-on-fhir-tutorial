require('dotenv').config()

const express = require('express');
var cluster = require('cluster');
var bodyParser = require('body-parser');

var port = 4000;

process.env.NODE_NO_WARNINGS = 1;

var cCPUs = 1; //require('os').cpus().length;
var now = (function () {
    var year = new Date(new Date().getFullYear().toString()).getTime();
    return function () {
        return Date.now() // - year
    }
})();

if (cluster.isMaster) {
    // Create a worker for each CPU
    for (var i = 0; i < cCPUs; i++) {
        cluster.fork();
    }

    cluster.on('online', function (worker) {
        console.log('Worker ' + worker.process.pid + ' is online.');
    });
    cluster.on('exit', function (worker, code, signal) {
        console.log('worker ' + worker.process.pid + ' died.');
    });
} else {
    var app = express();

    app.use(bodyParser.urlencoded({
        extended: true
    }));

    app.use('/lib', express.static(__dirname + '/lib'));
    app.use('/src', express.static(__dirname + '/src'));

    app.use(bodyParser.json());
    app
        .listen(port);

    app.get('/hudsonmusic', async (req, res) => {
        return res.sendFile(__dirname + '/hudsonmusic.html')
    });

    app.get('/launch', async (req, res) => {
        return res.sendFile(__dirname + '/launch.html')
    });

}
