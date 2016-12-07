const Express = require("express");
const HTTP = require("http");
const _ = require("lodash");

const router = Express.Router();

/* Conditional Data Controller */
function dataParser(request, verb, chunk) {
    if (verb === "all") {
        return _.takeRight(JSON.parse(chunk).data, 50);
    }

    if (request > 0) {
        return _.takeRight(JSON.parse(chunk).data, request);
    }

    return false;
}

/* GET home page. */
router.route("/")
    .get((req, res) => {
        res.render("index", {
            title: "Demo Application"
        });
    });

router.route("/api/send")
    .post((req, res) => {
        var postdata = {
            task: req.body.task,
            payload: req.body.payload
        };
        var request = HTTP.request({
            host: process.env.APIURI || "localhost",
            port: process.env.APIPORT || 3001,
            path: "/send",
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            }
        }, (data) => {
            let cache = "";

            data.on("data", (chunk) => {
                cache += chunk;
            });

            data.on ("end", () => {
                res.json(JSON.parse(cache));
            });
        }).on("error", (err) => {
            res.send(500).json(err);
        });
        request.write(JSON.stringify(postdata));
        request.end();
    });

router.route("/api/get/:verb")
    .get((req, res) => {
        HTTP.get({
            hostname: process.env.APIURI || "localhost",
            port: process.env.APIPORT || 3001,
            path: "/history"
        }, (data) => {
            let cache = "";
            let request = parseInt(req.params.verb, 10);

            data.on("data", (chunk) => {
                cache+=chunk;
            });

            data.on("end", () => {
                res.json(dataParser(request, req.params.verb, cache));
            });
        }).on("error", (err) => {
            res.status(500).json(err);
        });
    });

router.route("/history")
    .get((req, res) => {
        res.render("history", {
            title: "Demo Application"
        });
    });

module.exports = router;
