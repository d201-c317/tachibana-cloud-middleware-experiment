#!/usr/bin/env node
"use strict";

var database = { counter: 0, data: [] };
const port = process.env.PORT || 3000;

class Data {

    static db() { return database; };
    
    static getOneItem(id) { return database.data[id]; }

    static addOneItem(object) { database.data[object.id] = object; }

    static setResult(object) { database.data[object.seq].result = object; }

    static setStatus(id, value) { database.data[id].sent = value; }

    static reset() { database = { counter: 0, data: [] }; }

    static uuid() { return require("node-uuid").v1(); }
    
    static targetQueue() { return "in"; }

    static listenQueue() { return "out"; }

}

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
