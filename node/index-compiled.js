#!/usr/bin/env node


"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var database = { counter: 0, data: [] };
var port = process.env.PORT || 3000;
var AMQP = require("amqplib");
var AURI = "amqp://localhost";

/**
 * Data
 * To Access the imaginary JSON based database and some global data. It could be replaced by MongoDB.
 */

var Data = function () {
    function Data() {
        _classCallCheck(this, Data);
    }

    _createClass(Data, null, [{
        key: "db",
        value: function db() {
            return database;
        } // Get Full DB

    }, {
        key: "getOneItem",
        value: function getOneItem(id) {
            return database.data[id];
        } // Get One item in DB

    }, {
        key: "addOneItem",
        value: function addOneItem(object) {
            database.data[object.id] = object;
        } // Add ONe Item in DB

    }, {
        key: "setResult",
        value: function setResult(object) {
            database.data[object.seq].result = object;
        } // Set Processed Result

    }, {
        key: "setStatus",
        value: function setStatus(id, value) {
            database.data[id].sent = value;
        } // Set Delivery Status

    }, {
        key: "reset",
        value: function reset() {
            database = { counter: 0, data: [] };
        } // Clean the Database

    }, {
        key: "uuid",
        value: function uuid() {
            return require("node-uuid").v1();
        } // generate UUID

    }, {
        key: "targetQueue",
        value: function targetQueue() {
            return "in";
        } // get Queue Name

    }, {
        key: "listenQueue",
        value: function listenQueue() {
            return "out";
        } // Same.

    }]);

    return Data;
}();

/**
 * AMQP
 * Don't Touch.
 */


var Rabbit = function () {
    function Rabbit() {
        _classCallCheck(this, Rabbit);
    }

    _createClass(Rabbit, null, [{
        key: "writeMessage",
        value: function writeMessage(msg) {
            Data.addOneItem(msg);
            AMQP.connect(AURI).then(function (conn) {
                return conn.createChannel().then(function (ch) {
                    var q = ch.assertQueue(Data.targetQueue());
                    return q.then(function () {
                        ch.sendToQueue(Data.targetQueue(), new Buffer.from(JSON.stringify(msg)), { correlationId: msg.uuid });
                        console.log(" [x] SENT @ %s", msg.uuid);
                        Data.setStatus(msg.id, true);
                        return ch.close();
                    });
                }).finally(function () {
                    conn.close();
                });
            }).catch(console.warn);
        }
    }, {
        key: "receiveMessage",
        value: function receiveMessage() {
            AMQP.connect(AURI).then(function (conn) {
                process.once("SIGINT", function () {
                    conn.close();
                });
                return conn.createChannel().then(function (ch) {
                    var q = ch.assertQueue(Data.listenQueue());

                    q = q.then(function () {
                        ch.consume(Data.listenQueue(), function (msg) {
                            var msgContent = JSON.parse(msg.content.toString());
                            console.log(" [*] RECV @ %s", msg.properties.correlationId.toString());
                            return Data.setResult(msgContent);
                        }, { noAck: true });
                    });

                    return q.then(function () {
                        console.log(" [!] Waiting for messages via HTTP API @ Port %s. To exit press CTRL+C", port);
                    });
                });
            }).catch(console.warn);
        }
    }]);

    return Rabbit;
}();

/** App
 * The REST API.
 */


var App = function () {
    function App(port) {
        _classCallCheck(this, App);

        var express = require("express");
        var bodyParser = require("body-parser");
        this.app = express();
        this.app.use(bodyParser.json());
        this.app.listen(port);
    }

    _createClass(App, [{
        key: "start",
        value: function start() {
            Rabbit.receiveMessage();

            this.app.get("/clear", function (req, res) {
                Data.reset();
                res.json(Data.db());
            });

            this.app.get("/history", function (req, res) {
                res.json(Data.db());
            });

            this.app.get("/history/:id", function (req, res) {
                res.json(Data.getOneItem(req.params.id));
            });

            this.app.post("/send", function (req, res) {
                var task = req.body.task;
                var payload = req.body.payload;
                var message = { id: database.counter, task: task, payload: payload, uuid: Data.uuid(), sent: false, result: {} };

                res.json(message);
                Rabbit.writeMessage(message);
                database.counter++;
            });
        }
    }]);

    return App;
}();

var app = new App(port);
app.start();

//# sourceMappingURL=index-compiled.js.map