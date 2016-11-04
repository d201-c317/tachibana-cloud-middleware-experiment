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
            history.push(messageContent);
//          stack.push(messageContent);
            console.log(" [!] Message Payload : %s", messageContent.message);
            console.log(" [!] Message Task id : %s", messageContent.taskid);
            console.log(" [!] Message Server  : %s", messageContent.sysid);
            console.log(" [!] Message rel. ID : %s", msg.properties.correlationId.toString());
            console.log();
        }, {noAck: true});
    });
});

function writeMessage (msg) {
    amqp.connect("amqp://localhost", function(err, conn) {
        conn.createChannel(function(err, ch) {
            ch.assertQueue("in", {durable: false});
            ch.sendToQueue("in", new Buffer.from(msg.message), { correlationId: msg.uid });
            console.log(" [x] Sent %s @ %s", msg.message, msg.uid);
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
    var msg = req.body.message;
    var message = { message: msg, uid: uid };

    res.json({counter: counter.toString()});
    writeMessage(message);
    counter++;
});
