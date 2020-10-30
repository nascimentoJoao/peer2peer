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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
var readline_1 = __importDefault(require("readline"));
var exec = require("child_process").exec;
var dgram_1 = require("dgram");
var threads_1 = require("threads");
var server = dgram_1.createSocket('udp4');
var host = process.argv[2];
var port = process.argv[3];
var folder = process.argv[4];
server.bind(parseInt(port), host);
var availableResources = [];
var path = require('path');
var fs = require('fs');
var HttpRequests = require('../../http/HttpRequests');
var directoryPath = path.join(__dirname, folder);
//passing directoryPath and callback function
var generateResourcesAndHashes = function () {
    availableResources.splice(0, availableResources.length);
    fs.readdir(directoryPath, function (err, files) {
        //handling error
        if (err) {
            return console.log('Unable to scan directory: ' + err);
        }
        //listing all files using forEach
        //console.log('O peer vai fornecer os arquivos: '); 
        files.forEach(function (file) {
            exec("md5sum build/src/client/" + folder + "/" + file, function (error, stdout, stderr) {
                if (error) {
                    console.log("error: " + error.message);
                }
                if (stderr) {
                    console.log("error: " + stderr.message);
                }
                if (stdout) {
                    var md5Results = stdout.split(' ');
                    availableResources.push({ name: file, hash: md5Results[0] });
                }
            });
        });
    });
};
var startHeartbeat = function () { return __awaiter(void 0, void 0, void 0, function () {
    var heartbeatFunction;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, threads_1.spawn(new threads_1.Worker("./workers/sendHeartbeat"))];
            case 1:
                heartbeatFunction = _a.sent();
                return [4 /*yield*/, heartbeatFunction(host + ":" + port, "" + port)];
            case 2:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
var input = readline_1.default.createInterface({
    input: process.stdin,
    output: process.stdout
});
server.on('message', function (messageContent, rinfo) {
    var message = messageContent.toString();
    var parsedMessage = JSON.parse(message);
    if (parsedMessage.action == 'i_got_it') {
        //console.log('CONTEUDO TEXTO: ', parsedMessage.value);
        var contentOfFile = parsedMessage.value;
        fs.writeFile("build/src/client/" + folder + "/" + parsedMessage.name, contentOfFile, function (error) {
            if (error) {
                console.log('Error happened! ', error);
                return error;
            }
            console.log("\n\nArquivo recebido! Voc\u00EA pode acess\u00E1-lo em: build/src/client/" + folder + "/" + parsedMessage.name);
            console.log("\n\nAgora voc\u00EA \u00E9 um peer que fornece o arquivo " + parsedMessage.name + "!");
        });
        generateResourcesAndHashes();
        register();
    }
    var haveFile = false;
    if (parsedMessage.action == 'i_want_it') {
        console.log("\n\nO usu\u00E1rio em: " + rinfo.address + ":" + rinfo.port + " quer o arquivo com hash: " + parsedMessage.hash);
        var filenameToSend_1;
        availableResources.map(function (value) {
            if (value.hash == parsedMessage.hash) {
                haveFile = true;
                filenameToSend_1 = value.name;
            }
        });
        if (haveFile) {
            console.log('Enviando o arquivo...');
            fs.readFile("build/src/client/" + folder + "/" + filenameToSend_1, function (err, content) {
                var send = {
                    action: 'i_got_it',
                    name: filenameToSend_1,
                    value: content.toString()
                };
                server.send(Buffer.from(JSON.stringify(send)), rinfo.port, rinfo.address, function (error) {
                    if (error) {
                        console.log("Erro ao enviar arquivo. Erro: " + error);
                        throw error;
                    }
                    else {
                        console.log("\n\nArquivo enviado com sucesso!");
                    }
                });
            });
        }
        else {
            console.log('\n\nNão encontrei o arquivo... :/');
        }
        haveFile = false;
    }
});
var register = function () { return __awaiter(void 0, void 0, void 0, function () {
    var addressAndResources, options, e_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                console.log('\nRegistrando seus arquivos...');
                addressAndResources = JSON.stringify({
                    ip: host + ":" + port,
                    resources: availableResources
                });
                options = {
                    hostname: process.env.SERVER,
                    port: 8080,
                    path: '/peers/register',
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Content-Length': addressAndResources.length
                    }
                };
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, HttpRequests.post(options, addressAndResources)];
            case 2:
                _a.sent();
                console.log('\n\nPeer registrado com sucesso!');
                console.log("\nVerifique o arquivo de log na ra\u00EDz do projeto e veja o status do heartbeat.\n\n");
                startHeartbeat();
                return [3 /*break*/, 4];
            case 3:
                e_1 = _a.sent();
                console.log('\n\nNão consegui registrar os arquivos. Tente novamente...\n');
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
console.log('##### INICIANDO PEER #####\nDigite um dos comandos:\
\n\nexit: encerra o peer\nregister: registra o peer e seus arquivos\nresources: retorna os recursos e seus respectivos peers\
\nget <ip:port> <file>: inicia a transferência do arquivo para sua respectiva pasta\n\n');
generateResourcesAndHashes();
var recursiveReadLine = function () {
    input.question('Digite a opção desejada: \n\n', function (answer) {
        return __awaiter(this, void 0, void 0, function () {
            var options, response, err_1, formattedText_1, splittedAnswer, desiredHash, options, responseFromAPI, parsedFromAPI, peerAddress, i, resources, j, requestFile, addressSplitted, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (answer.toLowerCase() == 'exit') {
                            console.log('Encerrando a aplicação!');
                            return [2 /*return*/, input.close()];
                        }
                        if (!(answer.toLowerCase() == 'register')) return [3 /*break*/, 2];
                        return [4 /*yield*/, register()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        if (!(answer.toLowerCase() == 'resources')) return [3 /*break*/, 7];
                        console.log('Listando os recursos disponíveis:');
                        options = {
                            hostname: process.env.SERVER,
                            port: '8080',
                            path: '/peers',
                            method: 'GET'
                        };
                        response = void 0;
                        _a.label = 3;
                    case 3:
                        _a.trys.push([3, 5, , 6]);
                        return [4 /*yield*/, HttpRequests.get(options)];
                    case 4:
                        response = _a.sent();
                        return [3 /*break*/, 6];
                    case 5:
                        err_1 = _a.sent();
                        return [3 /*break*/, 6];
                    case 6:
                        response = JSON.parse(response);
                        formattedText_1 = [];
                        response.body.map(function (value, index) {
                            value.resources.map(function (innerValue, innerIndex) {
                                var object = { id: index, IP: value.ip, NOME: "" + innerValue.name, MD5SUM: "" + innerValue.hash };
                                formattedText_1.push(object);
                            });
                        });
                        console.table(formattedText_1);
                        _a.label = 7;
                    case 7:
                        if (!answer.toLowerCase().includes('get')) return [3 /*break*/, 11];
                        splittedAnswer = answer.split(" ");
                        desiredHash = splittedAnswer[1];
                        console.log('Tentando buscar arquivo com o hash: ', desiredHash);
                        options = {
                            hostname: process.env.SERVER,
                            port: '8080',
                            path: '/peers/',
                            method: 'GET'
                        };
                        responseFromAPI = void 0;
                        _a.label = 8;
                    case 8:
                        _a.trys.push([8, 10, , 11]);
                        return [4 /*yield*/, HttpRequests.get(options)];
                    case 9:
                        responseFromAPI = _a.sent();
                        parsedFromAPI = JSON.parse(responseFromAPI);
                        peerAddress = void 0;
                        for (i = 0; i < parsedFromAPI.body.length; i++) {
                            resources = parsedFromAPI.body[i].resources;
                            for (j = 0; j < resources.length; j++) {
                                if (resources[j].hash === desiredHash) {
                                    peerAddress = parsedFromAPI.body[i].ip;
                                    break;
                                }
                                if (peerAddress) {
                                    break;
                                }
                            }
                        }
                        if (peerAddress == host + ":" + port) {
                            console.log('Ei, esse arquivo é seu!\n');
                        }
                        else if (peerAddress == undefined) {
                            console.log('Não encontrei o peer ou o hash informado. :/\n\n');
                        }
                        else {
                            console.log('Encontrei o dono do arquivo! Seu endereço: ', peerAddress);
                            console.log('Comunicando com ele para obter seu arquivo...');
                            requestFile = {
                                action: 'i_want_it',
                                hash: desiredHash
                            };
                            addressSplitted = peerAddress.split(':');
                            // const addressSplitted = '192.168.100.19:8001';
                            // console.log(addressSplitted);
                            // Tratar a resposta da API e pedir ao ip retornado + o arquivo que bate com o hash informado
                            server.send(Buffer.from(JSON.stringify(requestFile)), parseInt(addressSplitted[1]), addressSplitted[0], function (error) {
                                if (error) {
                                    console.log("Erro ao solicitar arquivo! Erro: " + error);
                                    throw error;
                                }
                                else {
                                    console.log("Solicita\u00E7\u00E3o enviada. Aguardando...");
                                }
                            });
                        }
                        return [3 /*break*/, 11];
                    case 10:
                        error_1 = _a.sent();
                        console.log('Não consegui retornar nada do servidor.\n\n');
                        return [3 /*break*/, 11];
                    case 11:
                        recursiveReadLine();
                        return [2 /*return*/];
                }
            });
        });
    });
};
recursiveReadLine();
