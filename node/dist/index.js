#!/usr/bin/env node


"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var database = { counter: 0, data: [] };
var port = process.env.PORT || 3000;

/**
 * Database Emulation
 * 
 * @class Data
 */

var Data = function () {
    function Data() {
        _classCallCheck(this, Data);
    }

    _createClass(Data, null, [{
        key: "db",

        /**
         * Get Database
         * 
         * @static
         * @returns database
         * 
         * @memberOf Data
         */
        value: function db() {
            return database;
        }

        /**
         * Get one item from database
         * 
         * @static
         * @param {number} id job sequence
         * @returns database item
         * 
         * @memberOf Data
         */

    }, {
        key: "getOneItem",
        value: function getOneItem(id) {
            return database.data[id];
        }

        /**
         * Add one job to database
         * 
         * @static
         * @param {any} object Job object
         * @returns {void}
         * @memberOf Data
         */

    }, {
        key: "addOneItem",
        value: function addOneItem(object) {
            database.data[object.id] = object;
        }

        /**
         * Store the result of the job.
         * 
         * @static
         * @param {any} object Result object
         * 
         * @memberOf Data
         */

    }, {
        key: "setResult",
        value: function setResult(object) {
            database.data[object.seq].result = object;
        }

        /**
         * Set the delivery status of the item.
         * 
         * @static
         * @param {number} id Job seq
         * @param {any} value Delivery status
         * @returns {void}
         * @memberOf Data
         */

    }, {
        key: "setStatus",
        value: function setStatus(id, value) {
            database.data[id].sent = value;
        }

        /**
         * Clear the Database
         * 
         * @static
         * @returns {void}
         * @memberOf Data
         */

    }, {
        key: "reset",
        value: function reset() {
            database = { counter: 0, data: [] };
        }
    }]);

    return Data;
}();

/**
 * Common Tools
 * 
 * @class Tool
 */


var Tool = function () {
    function Tool() {
        _classCallCheck(this, Tool);
    }

    _createClass(Tool, null, [{
        key: "uuid",

        /**
         * UUID Generator
         * 
         * @static
         * @returns {string} UUID
         * 
         * @memberOf Tool
         */
        value: function uuid() {
            return require("node-uuid").v1();
        }
    }]);

    return Tool;
}();

/**
 * AMQP Access
 * 
 * @class Rabbit
 */


var Rabbit = function () {
    /**
     * Creates an instance of Rabbit.
     * 
     * @returns {void}
     * @memberOf Rabbit
     */
    function Rabbit() {
        _classCallCheck(this, Rabbit);

        this.AMQP = require("amqplib");
        this.AURI = process.env.AMQP_URI || "amqp://localhost";
        this.target = "in";
        this.listen = "out";
    }

    /**
     * Publish message
     * 
     * @param {any} msg message object
     * @returns {void}
     * @memberOf Rabbit
     */


    _createClass(Rabbit, [{
        key: "writeMessage",
        value: function writeMessage(msg) {
            var target = this.target;
            Data.addOneItem(msg);
            this.AMQP.connect(this.AURI).then(function (conn) {
                return conn.createChannel().then(function (ch) {
                    var q = ch.assertQueue(target);
                    return q.then(function () {
                        ch.sendToQueue(target, new Buffer.from(JSON.stringify(msg)), { correlationId: msg.uuid });
                        console.log(" [x] SENT @ %s", msg.uuid);
                        Data.setStatus(msg.id, true);
                        return ch.close();
                    });
                }).finally(function () {
                    conn.close();
                });
            }).catch(console.warn);
        }

        /**
         * message receiver
         * 
         * @returns {void}
         * @memberOf Rabbit
         */

    }, {
        key: "receiveMessage",
        value: function receiveMessage() {
            var listen = this.listen;
            this.AMQP.connect(this.AURI).then(function (conn) {
                process.once("SIGINT", function () {
                    conn.close();
                });
                return conn.createChannel().then(function (ch) {
                    var q = ch.assertQueue(listen);
                    q = q.then(function () {
                        ch.consume(listen, function (msg) {
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

/**
 * The API Core
 * 
 * @class App
 */


var App = function () {
    /**
     * Creates an instance of API.
     * 
     * @param {number} port Port No.
     * 
     * @memberOf App
     */
    function App(port) {
        _classCallCheck(this, App);

        var express = require("express");
        var bodyParser = require("body-parser");
        this.app = express();
        this.app.use(bodyParser.json());
        this.app.listen(port);
    }

    /**
     * Start the API
     * 
     * 
     * @memberOf App
     */


    _createClass(App, [{
        key: "start",
        value: function start() {
            var rabbit = new Rabbit();
            rabbit.receiveMessage();

            /**
             * GET /clear
             * Empty the database.
             */
            this.app.get("/clear", function (req, res) {
                Data.reset();
                res.json(Data.db());
            });

            /**
             * GET /history
             * Get the list of jobs.
             */
            this.app.get("/history", function (req, res) {
                res.json(Data.db());
            });

            /** 
             * GET /history/:id
             * Get the details of specific job 
             * @param {number} id The job seq
             */
            this.app.get("/history/:id", function (req, res) {
                res.json(Data.getOneItem(req.params.id));
            });

            /**
             * POST /send
             * Entry point of Job
             * @param {string} task The task
             * @param {string} payload The task payload
             */
            this.app.post("/send", function (req, res) {
                var task = req.body.task;
                var payload = req.body.payload;
                var message = { id: database.counter, task: task, payload: payload, uuid: Tool.uuid(), sent: false, result: {} };

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
//# sourceMappingURL=index.js.map