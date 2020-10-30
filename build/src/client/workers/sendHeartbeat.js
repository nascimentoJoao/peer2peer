"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
var worker_1 = require("threads/worker");
var HttpRequests = require('../../../http/HttpRequests');
var fs = require('fs');
worker_1.expose(function beat(peerIp, port) {
    return __awaiter(this, void 0, void 0, function () {
        var dateObj, month, day, year, body, options, heartbeat, stringToLog, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!true) return [3 /*break*/, 6];
                    dateObj = new Date();
                    month = dateObj.getUTCMonth() + 1;
                    day = dateObj.getUTCDate();
                    year = dateObj.getUTCFullYear();
                    body = JSON.stringify({
                        ip: peerIp
                    });
                    options = {
                        hostname: process.env.SERVER,
                        port: 8080,
                        path: '/peers/ping',
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Content-Length': body.length
                        }
                    };
                    heartbeat = void 0;
                    stringToLog = '';
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, HttpRequests.put(options, body)];
                case 2:
                    heartbeat = _a.sent();
                    heartbeat = JSON.parse(heartbeat);
                    if (heartbeat.code === 204) {
                        stringToLog = "[" + peerIp + "]_fine_at_" + new Date() + "\n";
                    }
                    return [3 /*break*/, 4];
                case 3:
                    err_1 = _a.sent();
                    stringToLog = "[" + peerIp + "]_error_at_" + new Date() + "_[traz_cloroquina_pro_pai]\n";
                    return [3 /*break*/, 4];
                case 4:
                    fs.appendFile(year + "-" + month + "-" + day + ".txt", stringToLog, { flag: 'a+' }, function (error) {
                        if (error) {
                            console.log('Error happened! ', error);
                            return error;
                        }
                    });
                    return [4 /*yield*/, delay(4000)];
                case 5:
                    _a.sent();
                    return [3 /*break*/, 0];
                case 6: return [2 /*return*/];
            }
        });
    });
});
function delay(ms) {
    return new Promise(function (resolve) { return setTimeout(resolve, ms); });
}
