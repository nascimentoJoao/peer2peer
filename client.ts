import readLine from 'readline';
const { exec } = require("child_process");
import { createSocket, Socket } from 'dgram';
import { Resource } from './interfaces/Resource';
import { spawn, Thread, Worker } from "threads";

const server = createSocket('udp4');
const host = process.argv[2];
const port = process.argv[3];
const folder = process.argv[4];

server.bind(parseInt(port), host);

const availableResources: Resource[] = [];

const path = require('path');
const fs = require('fs');
const HttpRequests = require('./http/HttpRequests');
const directoryPath = path.join(__dirname, folder);

//passing directoryPath and callback function
const generateResourcesAndHashes = () => {

  availableResources.splice(0, availableResources.length);

  fs.readdir(directoryPath, function (err, files) {
    //handling error
    if (err) {
      return console.log('Unable to scan directory: ' + err);
    }
    //listing all files using forEach
    //console.log('O peer vai fornecer os arquivos: '); 
    files.forEach(function (file) {
      exec(`md5sum build/${folder}/${file}`, (error, stdout, stderr) => {
        if (error) {
            console.log(`error: ${error.message}`);
        }

        if (stderr) {
            console.log(`error: ${stderr.message}`);
        }

        if (stdout) {
            const md5Results = stdout.split(' ');
            availableResources.push({ name: file, hash: md5Results[0] });
        }
    })
    });
  });
}

const startHeartbeat = async () => {
  const algo = await spawn(new Worker("./workers/sendHeartbeat"));
  console.log('bisnaga: ', algo);
  await algo();
}

let input = readLine.createInterface({
  input: process.stdin,
  output: process.stdout
});

server.on('message', (messageContent, rinfo) => {

  const message = messageContent.toString();
  const parsedMessage = JSON.parse(message);

  let haveFile = false;

  console.log('parseado: ', parsedMessage);

  if(parsedMessage.action == 'i_want') {
    console.log(`O usuário em: ${rinfo.address}:${rinfo.port} quer o arquivo com hash: ${parsedMessage.hash}`);

    availableResources.map(value => {
      if(value.hash == parsedMessage.hash) {
        haveFile = true;
        console.log('EU TENHO ESSE ARQUIVO!');
      }
    })

    if(haveFile) {
      console.log('enviando o arquivo para o fulano');
      server.send(Buffer.from('TOMA FIO'), 8001, '192.168.100.19', (error) => {
        if (error) throw error
        console.log(`PEER ENVIA`);
      })
    } else {
      console.log('Não tenho esse arquivo... :/\n\n');
      console.log('PEER NÃO ENVIA')
    }

    haveFile = false;
  }

  console.log(`Servidor recebeu '${messageContent}' de ${rinfo.address}:${rinfo.port}`);
});

console.log('##### INICIANDO PEER #####\nDigite um dos comandos:\
\n\nexit: encerra o peer\nregister: registra o peer e seus arquivos\nresources: retorna os recursos e seus respectivos peers\
\nget <ip:port> <file>: inicia a transferência do arquivo para sua respectiva pasta\n\n')

generateResourcesAndHashes();

var recursiveReadLine = function () {

  input.question('Digite a opção desejada: \n\n', async function (answer) {
    if (answer == 'exit') {
      console.log('Encerrando a aplicação!');
      return input.close();
    }

    if (answer == 'register') {
      console.log('Registrando seus arquivos...');
      const options = {
        hostname: 'localhost',
        port: '8100',
        path: '/register',
        method: 'POST'
      }

      const addressAndResources = {
        ip: `${host}:${port}`,
        resources: availableResources
      }

      console.log('address and resources ', addressAndResources);

      // const responseFromPost = await HttpRequests.post(options, addressAndResources);
      // console.log('resposta do post: ', responseFromPost);

      startHeartbeat();
    }

    if (answer == 'resources') {
      console.log('Listando todos os seus recursos...');
      const options = {
        hostname: 'localhost',
        port: '8100',
        path: '/',
        method: 'GET'
      }
      const response = await HttpRequests.get(options);
      console.log('response from api', response);
    }

    if (answer == 'get') {

      // const options = {
      //   hostname: 'localhost',
      //   port: '8100',
      //   path: '/ip-ou-hash',
      //   method: 'GET'
      // }

      // const responseFromAPI = await HttpRequests.get(options)

      const requestFile = {
        action: 'i_want',
        hash: 'ff44dc1389131b5420370e25c56730a0'
      }

      //Tratar a resposta da API e pedir ao ip retornado + o arquivo que bate com o hash informado
      server.send(Buffer.from(JSON.stringify(requestFile)), 8000, '192.168.100.19', (error) => {
        if (error) throw error
        console.log(`Servidor responde`);
      });
    }

    recursiveReadLine();
  });
};

recursiveReadLine();