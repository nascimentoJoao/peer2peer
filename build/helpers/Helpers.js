"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var path = require('path');
var fs = require('fs');
var exec = require("child_process").exec;
exports.scanFilesAndGenerateObject = function (folder) { return new Promise(function (reject, resolve) {
    var availableResources = [];
    try {
        var directoryPath = path.join(__dirname, folder);
        //passing directoryPath and callback function
        fs.readdir(directoryPath, function (err, files) {
            //handling error
            if (err) {
                return console.log('Unable to scan directory: ' + err);
            }
            //listing all files using forEach
            //console.log('O peer vai fornecer os arquivos: '); 
            files.forEach(function (file) {
                // Do whatever you want to do with the file
                //console.log(`\n${file}`); 
                exec("md5sum build/helpers/" + folder + "/" + file, function (error, stdout, stderr) {
                    if (error) {
                        console.log("error: " + error.message);
                        reject(error);
                    }
                    if (stderr) {
                        console.log("error: " + stderr.message);
                        reject(stderr);
                    }
                    if (stdout) {
                        var md5Results = stdout.split(' ');
                        availableResources.push({ name: file, hash: md5Results[0] });
                    }
                });
            });
        });
        resolve(availableResources);
    }
    catch (error) {
        console.log('oops ', error);
        reject(error);
    }
}); };
