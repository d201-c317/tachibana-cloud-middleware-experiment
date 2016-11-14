#!/usr/bin/env node

"use strict";

var database = { counter: 0, data: [] };
const port = process.env.PORT || 3000;

/**
 * Database Emulation
 * 
 * @class Data
 */
class Data {
    /**
     * Get Database
     * 
     * @static
     * @returns database
     * 
     * @memberOf Data
     */
    static db() {
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
    static getOneItem(id) {
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
    static addOneItem(object) {
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
    static setResult(object) {
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
    static setStatus(id, value) {
        database.data[id].sent = value;
    }

    /**
     * Clear the Database
     * 
     * @static
     * @returns {void}
     * @memberOf Data
     */
    static reset() {
        database = { counter: 0, data: [] };
    }
}

/**
 * Common Tools
 * 
 * @class Tool
 */
class Tool {
    /**
     * UUID Generator
     * 
     * @static
     * @returns {string} UUID
     * 
     * @memberOf Tool
     */
    static uuid() {
        return require("node-uuid").v1();
    }
}

/**
 * AMQP Access
 * 
 * @class Rabbit
 */
class Rabbit {
    /**
     * Creates an instance of Rabbit.
     * 
     * @returns {void}
     * @memberOf Rabbit
     */
    constructor() {
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
    writeMessage(msg) {
        const target = this.target;
        Data.addOneItem(msg);
        this.AMQP.connect(this.AURI).then(function(conn) {
            return conn.createChannel().then(function(ch) {
                const q = ch.assertQueue(target);
                return q.then(function() {
                    ch.sendToQueue(target, new Buffer.from(JSON.stringify(msg)), { correlationId: msg.uuid });
                    console.log(" [x] SENT @ %s", msg.uuid);
                    Data.setStatus(msg.id, true);
                    return ch.close();
                });
            }).finally(function() {
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
    receiveMessage() {
        const listen = this.listen;
        this.AMQP.connect(this.AURI).then(function(conn) {
            process.once("SIGINT", function() {
                conn.close();
            });
            return conn.createChannel().then(function(ch) {
                var q = ch.assertQueue(listen);
                q = q.then(function() {
                    ch.consume(listen, function(msg) {
                        var msgContent = JSON.parse(msg.content.toString());
                        console.log(" [*] RECV @ %s", msg.properties.correlationId.toString());
                        return Data.setResult(msgContent);
                    }, { noAck: true });
                });
                return q.then(function() {
                    console.log(" [!] Waiting for messages via HTTP API @ Port %s. To exit press CTRL+C", port);
                });
            });
        }).catch(console.warn);
    }
}

/**
 * The API Core
 * 
 * @class App
 */
class App {
    /**
     * Creates an instance of API.
     * 
     * @param {number} port Port No.
     * 
     * @memberOf App
     */
    constructor(port) {
        const express = require("express");
        const bodyParser = require("body-parser");
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
    start() {
        const rabbit = new Rabbit();
        rabbit.receiveMessage();

        /**
         * GET /clear
         * Empty the database.
         */
        this.app.get("/clear", function(req, res) {
            Data.reset();
            res.json(Data.db());
        });

        /**
         * GET /history
         * Get the list of jobs.
         */
        this.app.get("/history", function(req, res) {
            res.json(Data.db());
        });

        /** 
         * GET /history/:id
         * Get the details of specific job 
         * @param {number} id The job seq
         */
        this.app.get("/history/:id", function(req, res) {
            res.json(Data.getOneItem(req.params.id));
        });

        /**
         * POST /send
         * Entry point of Job
         * @param {string} task The task
         * @param {string} payload The task payload
         */
        this.app.post("/send", function(req, res) {
            var task = req.body.task;
            var payload = req.body.payload;
            var message = { id: database.counter, task: task, payload: payload, uuid: Tool.uuid(), sent: false, result: {} };

            res.json(message);
            rabbit.writeMessage(message);
            database.counter++;
        });
    }
}

const app = new App(port);
app.start();