#!/usr/bin/env node
/*eslint-disable no-console */

const amqp = require("amqplib/callback_api");
const uuid = require("node-uuid");
const express = require("express");
const bodyParser = require("body-parser");
const app = express();

const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.listen(port);

// var stack   = [];
var history = [];
var counter = 0;

console.log(" [!] Waiting for messages via HTTP API @ Port %s. To exit press CTRL+C", port);

amqp.connect("amqp://localhost", function(err, conn) {
    conn.createChannel(function(err, ch) {
        ch.assertQueue("out", {durable: false});
        ch.consume("out", function(msg) {
            var messageContent = JSON.parse(msg.content.toString());
            history[messageContent.seq].result = messageContent;
//          stack.push(messageContent);
            console.log(" [!] Message Payload : %s", messageContent.payload);
            console.log(" [!] Message Task id : %s", messageContent.taskid);
            console.log(" [!] Message Server  : %s", messageContent.sysid);
            console.log(" [!] Message rel. ID : %s", msg.properties.correlationId.toString());
            console.log();
        }, {noAck: true});
    });
});

function writeMessage (msg) {
    history[msg.seq] = msg;
    message = JSON.stringify(msg);
    amqp.connect("amqp://localhost", function(err, conn) {
        conn.createChannel(function(err, ch) {
            ch.assertQueue("in", {durable: false});
            ch.sendToQueue("in", new Buffer.from(message), { correlationId: msg.uuid });
            console.log(" [x] Sent %s", msg.uuid);
        });
    });
    return true;
}

/* Reserved Method, it just show a stack of response and clear
 * app.get("/get", function(req, res){
 *  res.json(stack);
 *  stack = [];
 *});
 */

app.get("/clear", function(req, res) {
    history = [];
    counter = 0;
    res.json({ message: "Done" });
});

app.get("/history", function(req, res){
    res.json(history);
});

app.get("/history/:id", function(req, res){
    res.json(history[req.params.id]);
});

app.post("/send", function(req, res){
    var uid = uuid.v1();
    var task = req.body.task;
    var payload = req.body.payload;
    var message = { task: task, payload: payload, seq: counter, uuid: uid , result: {}};

    res.json({counter: counter.toString()});
    writeMessage(message);
    counter++;
});
