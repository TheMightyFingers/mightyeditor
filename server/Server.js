"use strict";
require("../client/eClass.js");
createClass("SF", global, require("path").resolve(""));

SF.require("http.Httpd");

new SF.http.Httpd("../client", 8080, null);



