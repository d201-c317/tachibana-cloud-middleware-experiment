#!/usr/bin/env node
"use strict";

var database = { counter: 0, data: [] };
const port = process.env.PORT || 3000;

/**
 * Data
 * To Access the imaginary JSON based database and some global data. It could be replaced by MongoDB.
 */
class Data {
    static db() { return database; }                                            // Get Full DB
    static getOneItem(id) { return database.data[id]; }                         // Get One item in DB
    static addOneItem(object) { database.data[object.id] = object; }            // Add ONe Item in DB
    static setResult(object) { database.data[object.seq].result = object; }     // Set Processed Result
    static setStatus(id, value) { database.data[id].sent = value; }             // Set Delivery Status
    static reset() { database = { counter: 0, data: [] }; }                     // Clean the Database
    static uuid() { return require("node-uuid").v1(); }                         // generate UUID
    static targetQueue() { return "in"; }                                       // get Queue Name
    static listenQueue() { return "out"; }                                      // Same.
}

/**
 * AMQP
 * Don't Touch.
 */
class Rabbit {
    constructor () { 
        this.amqp = require("amqplib").connect("amqp://localhost");
    }

    writeMessage (msg) {
        Data.addOneItem(msg);
        this.amqp.then(function(conn) {
            return conn.createChannel();
        }).then(function(channel) {
            return channel.assertQueue(Data.targetQueue()).then(function() {
                channel.sendToQueue(Data.targetQueue(), new Buffer.from(JSON.stringify(msg)), { correlationId: msg.uuid });
                console.log(" [x] Sent %s", msg.uuid);
                return Data.setStatus(msg.id, true);
            });
        });
    }
    
    receiveMessage () {
        this.amqp.then(function(conn) {
            return conn.createChannel();
        }).then(function(channel) {
            return channel.assertQueue(Data.listenQueue()).then(function() {
                channel.consume(Data.listenQueue(), function(msg) {
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
}

/** App
 * The REST API.
 */
class App {
    constructor (port) {
        const express = require("express");
        const bodyParser = require("body-parser");
        this.app = express();
        this.app.use(bodyParser.json());
        this.app.listen(port);
        console.log(" [!] Waiting for messages via HTTP API @ Port %s. To exit press CTRL+C", port);
    }

    start () {
        const rabbit = new Rabbit();
        rabbit.receiveMessage();

        this.app.get("/clear", function(req, res) {
            Data.reset();            
            res.json(Data.db());
        });

        this.app.get("/history", function(req, res){
            res.json(Data.db());
        });

        this.app.get("/history/:id", function(req, res){
            res.json(Data.getOneItem(req.params.id));
        });

        this.app.post("/send", function(req, res){
            var task = req.body.task;
            var payload = req.body.payload;
            var message = { id: database.counter, task: task, payload: payload, uuid: Data.uuid() , sent: false, result: {}};

            res.json(message);
            rabbit.writeMessage(message);
            database.counter++;
        });
    }
}

const app = new App(port);
app.start();
