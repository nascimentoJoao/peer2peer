"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PeerController = void 0;
var express_1 = require("express");
var __1 = require("..");
var router = express_1.Router();
/**
 * Returns a list of all avaliable resources and their respective hosts.
 * @returns A JSON object, containing a list of all available resources and their respective hosts
 */
router.get('/', function (request, response) {
    console.log(__1.App.getInstance().peers);
    var peers = __spreadArrays(__1.App.getInstance().peers).map(function (peer) {
        return {
            ip: peer.ipAddress,
            resources: peer.resources
        };
    });
    response.send({ code: 200, body: JSON.parse(JSON.stringify(peers)) });
});
/**
 * Registers a new peer into the peer list and its resources.
 * @returns The newly added Peer object
 */
router.post('/register', function (request, response) {
    var payload = request.body;
    var newPeer = {
        ipAddress: payload.ip,
        lastPing: new Date(),
        resources: payload.resources
    };
    __1.App.getInstance().peers.push(newPeer);
    response.send({ code: 201, body: JSON.parse(JSON.stringify(newPeer)) });
});
/**
 * Updates a peer's last seen alive status.
 * @returns A HttpResponse object with status code 204
 */
router.put('/ping', function (request, response) {
    var payload = request.body;
    var peer = __1.App.getInstance().peers.find(function (p) { return p.ipAddress === payload.ip; });
    if (!peer) {
        response.send({ code: 404, error: "The peer with ip " + payload.ip + " does not exist or could not be found." });
        return;
    }
    peer.lastPing = new Date();
    response.send({ code: 204 });
});
exports.PeerController = router;
