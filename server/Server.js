"use strict";
require("../client/src/eClass.js");
createClass("SF", global, require("path").resolve(""));

SF.require("http.Httpd");


var server = new SF.http.Httpd("../client", 8080);







