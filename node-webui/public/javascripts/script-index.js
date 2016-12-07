
"use strict";

(function($) {

    /**
     * JSON Endpoint Poller
     * @returns {any} null
     */
    const poll = function () {
        $.ajax({
            "dataType": "json",
            "success": function (data) {
                $.each(data, function (key, val) {
                    const tr = $("<tr/>");

                    $("<td/>", {"html": val.id}).appendTo(tr);
                    $("<td/>", {"html": val.task}).appendTo(tr);
                    $("<td/>", {"html": val.payload}).appendTo(tr);
                    // eslint-disable-next-line max-len, no-magic-numbers
                    $("<td/>", {"html": val.result.payload}).appendTo(tr);

                    tr.appendTo("#result-body");
                });
            },
            "timeout": 2000,
            "type": "GET",
            "url": "/api/get/5"
        });
    };

    $(document).ready(function () {
        const msec = 1000,
            sec = 5,
            timeoutVal = sec * msec;

        // Fire the first Time
        poll();

        // The next time are automatically triggered by timer...
        setInterval(() => {
            $("#result-body").html("");
            poll();
        }, timeoutVal);
    });

    $("#send-form").submit(function (event) {
        event.prevenDefault;

        $.post("/api/send", {
            "task": $("#jobType").val(),
            "payload": $("#jobPayload").val()
        }, function (data) {
            $("#response").modal();
            $("#response-data").html(JSON.stringify(data, null, 2));
        }, "json");

        return false;
    });

}(jQuery));
