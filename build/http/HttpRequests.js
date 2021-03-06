"use strict";
var http = require('http');
exports.post = function (options, requestBody) { return new Promise(function (resolve, reject) {
    var req = http.request(options, function (res) {
        var body = '';
        res.on('data', function (data) {
            body += data;
        });
        res.on('end', function (_) {
            resolve(body);
        });
    });
    req.on('error', function (error) {
        console.log("Erro tentando efetuar chamada POST!\n\n " + error);
        reject(error);
    });
    req.write(requestBody);
    req.end();
}); };
exports.get = function (options, requestBody) { return new Promise(function (resolve, reject) {
    var req = http.request(options, function (res) {
        var body = '';
        res.on('data', function (chunk) {
            body += chunk;
        });
        res.on('end', function (_) {
            resolve(body);
        });
    });
    req.on('error', function (error) {
        console.log("Erro tentando efetuar chamada GET!\n\n " + error);
        reject(error);
    });
    req.end();
}); };
exports.put = function (options, requestBody) { return new Promise(function (resolve, reject) {
    var req = http.request(options, function (res) {
        var body = '';
        res.on('data', function (data) {
            body += data;
        });
        res.on('end', function (_) {
            resolve(body);
        });
    });
    req.on('error', function (error) {
        console.log("Erro tentando efetuar chamada PUT!\n\n " + error);
        reject(error);
    });
    req.write(requestBody);
    req.end();
}); };
