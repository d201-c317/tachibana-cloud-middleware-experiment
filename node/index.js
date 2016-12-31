#!/usr/bin/env node

"use strict";

const AMQP = require("amqplib");
const Restify = require("restify");

var database = { counter: 0, data: [] };
const port = process.env.PORT || 3001;

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
     * @returns {Array} database
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
        database.data.push(object);
        database.counter++;
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

    /**
     * Get Counter
     *
     * @static
     * @returns {number} Database Counter Status
     *
     * @memberOf Data
     */
    static getCounter() {
        return database.counter;
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
        return require("uuid/v1")();
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
        this.AURI = process.env.AMQP_URI || "amqp://localhost";
        this.target = "test";
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
        AMQP.connect(this.AURI).then((conn) => conn.createChannel().then((ch) => {
            var done = ch.assertExchange(target, "topic", { durable: false });
            return done.then(() => {
                ch.publish(target, msg.task, new Buffer.from(JSON.stringify(msg)), { correlationId: msg.uuid });
                console.log(" [x] SENT @ %s", msg.uuid);
                return ch.close();
            });
        }).finally(() => {
            Data.setStatus(msg.id, true);
            conn.close();
        })).catch(console.warn);
    }

    /**
     * message receiver
     *
     * @returns {void}
     * @memberOf Rabbit
     */
    receiveMessage() {
        const listen = this.listen;
        AMQP.connect(this.AURI).then((conn) => {
            process.once("SIGINT", () => {
                conn.close();
            });
            return conn.createChannel().then((ch) => {
                ch.assertQueue(listen).then(() => {
                    ch.consume(listen, (msg) => {
                        let msgContent = JSON.parse(msg.content.toString());
                        console.log(" [*] RECV @ %s", msg.properties.correlationId.toString());
                        return Data.setResult(msgContent);
                    }, { noAck: true });
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
        this.app = Restify.createServer();
        this.app.pre(Restify.pre.userAgentConnection());
        this.app.use(Restify.bodyParser({ mapParams: true }));
        this.app.listen(port);
    }

    /**
     * Start the API
     *
     *
     * @memberOf App
     */
    start() {
        console.log("%s listening at %s", this.app.name, this.app.url);

        const rabbit = new Rabbit();
        rabbit.receiveMessage();

        /**
         * GET /clear
         * Empty the database.
         */
        this.app.get("/clear", (req, res, next) => {
            Data.reset();
            res.json(200, Data.db());

            return next();
        });

        /**
         * GET /history
         * Get the list of jobs.
         */
        this.app.get("/history", (req, res, next) => {
            res.json(200, Data.db());

            return next();
        });

        /**
         * GET /history/:id
         * Get the details of specific job
         * @param {number} id The job seq
         */
        this.app.get("/history/:id", (req, res, next) => {
            res.json(200, Data.getOneItem(req.params.id));

            return next();
        });

        /**
         * POST /send
         * Entry point of Job
         * @param {string} task The task
         * @param {string} payload The task payload
         */
        this.app.post("/send", (req, res, next) => {
            let task = req.params.task;
            let payload = req.params.payload;
            let message = { id: database.counter, task: task, payload: payload, uuid: Tool.uuid(), sent: false, result: {} };

            res.json(201, message);
            rabbit.writeMessage(message);

            return next();
        });
    }
}

const app = new App(port);
app.start();
