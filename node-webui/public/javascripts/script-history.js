
"use strict";

(function($) {

    /**
     * JSON Endpoint Poller
     * @returns {any} null
     */
    const poll = function () {
        $("#result-body").html("");
        $.ajax({
            "dataType": "json",
            "success": function (data) {
                $.each(data, function (key, val) {
                    const tr = $("<tr/>");

                    $("<td/>", {"html": val.id}).appendTo(tr);
                    $("<td/>", {"html": val.task}).appendTo(tr);
                    $("<td/>", {"html": val.payload}).appendTo(tr);
                    $("<td/>", {"html": val.uuid.split("-")[0]}).appendTo(tr);
                    $("<td/>", {"html": val.result.payload}).appendTo(tr);

                    tr.appendTo("#result-body");
                });
            },
            "timeout": 2000,
            "type": "GET",
            "url": "/api/get/all"
        });
    };

    $(document).ready(function () {
        const msec = 1000,
            sec = 30,
            timeoutVal = sec * msec;

        // Fire the first Time
        poll();

        setInterval(() => {
            $("#result-body").html("");
            poll();
        }, timeoutVal);
    });

}(jQuery));
