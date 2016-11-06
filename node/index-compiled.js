#!/usr/bin/env node

"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var database = { counter: 0, data: [] };
var port = process.env.PORT || 3000;

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

        this.amqp = require("amqplib").connect("amqp://localhost");
    }

    _createClass(Rabbit, [{
        key: "writeMessage",
        value: function writeMessage(msg) {
            Data.addOneItem(msg);
            this.amqp.then(function (conn) {
                return conn.createChannel();
            }).then(function (channel) {
                return channel.assertQueue(Data.targetQueue()).then(function () {
                    channel.sendToQueue(Data.targetQueue(), new Buffer.from(JSON.stringify(msg)), { correlationId: msg.uuid });
                    console.log(" [x] Sent %s", msg.uuid);
                    return Data.setStatus(msg.id, true);
                });
            });
        }
    }, {
        key: "receiveMessage",
        value: function receiveMessage() {
            this.amqp.then(function (conn) {
                return conn.createChannel();
            }).then(function (channel) {
                return channel.assertQueue(Data.listenQueue()).then(function () {
                    channel.consume(Data.listenQueue(), function (msg) {
                        var msgContent = JSON.parse(msg.content.toString());
                        console.log(" [!] Message Payload : %s", msgContent.payload);
                        console.log(" [!] Message Task id : %s", msgContent.taskid);
                        console.log(" [!] Message Server  : %s", msgContent.sysid);
                        console.log(" [!] Message rel. ID : %s", msg.properties.correlationId.toString());
                        console.log();
                        return Data.setResult(msgContent);
                    }, { noAck: true });
                });
            });
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
        console.log(" [!] Waiting for messages via HTTP API @ Port %s. To exit press CTRL+C", port);
    }

    _createClass(App, [{
        key: "start",
        value: function start() {
            var rabbit = new Rabbit();
            rabbit.receiveMessage();

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
                rabbit.writeMessage(message);
                database.counter++;
            });
        }
    }]);

    return App;
}();

var app = new App(port);
app.start();

//# sourceMappingURL=index-compiled.js.map