#!/usr/bin/env node --harmony

var path = require("path");

var go = require("gocsp");

go.require(path.join(process.env.PWD, process.argv[2]));
