"use strict";

// Modules const
const Express = require("express");
const Path = require("path");
const BodyParser = require("body-parser");
const ServeFavicon = require("serve-favicon");
const Logger = require("morgan");
const Stylus = require("stylus");
const CookieParser = require("cookie-parser");

// Main Runtime Namespace Bootstrapper
const app = Express();

// view engine setup
app.set("views", Path.join(__dirname, "views"));
app.set("view engine", "pug");

// uncomment after placing your favicon in /public
app.use(ServeFavicon(Path.join(__dirname, "public", "favicon.ico")));
app.use(Logger("dev"));
app.use(BodyParser.json());
app.use(BodyParser.urlencoded({ extended: true }));
app.use(CookieParser());
app.use(Stylus.middleware(Path.join(__dirname, "public")));
app.use(Express.static(Path.join(__dirname, "public")));

app.use("/", require("./routes/index"));

// catch 404 and forward to error handler
app.use((req, res, next) => {
    var err = new Error("Not Found");
    err.status = 404;
    next(err);
});

// error handler
app.use((err, req, res, next) => {
    // render the error page
    res.status(err.status || 500);
    res.render("error", {
        title: "Express",
        message: err.message,
        error: req.app.get("env") === "development" ? err : {} // set locals, only providing error in development 
    });
    next();
});

module.exports = app;
