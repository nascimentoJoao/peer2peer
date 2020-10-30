import readLine from 'readline';
const { exec } = require("child_process");
import { createSocket } from 'dgram';
import { Resource } from '../server/interfaces/Resource';
import { spawn, Worker } from "threads";

const server = createSocket('udp4');
const host = process.argv[2];
const port = process.argv[3];
const folder = process.argv[4];

server.bind(parseInt(port), host);

const availableResources: Resource[] = [];

const path = require('path');
const fs = require('fs');
const HttpRequests = require('../../http/HttpRequests');
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
      exec(`md5sum build/src/client/${folder}/${file}`, (error, stdout, stderr) => {
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
  const heartbeatFunction = await spawn(new Worker("./workers/sendHeartbeat"));
  await heartbeatFunction(`${host}:${port}`);
}

let input = readLine.createInterface({
  input: process.stdin,
  output: process.stdout
});

server.on('message', (messageContent, rinfo) => {

  const message = messageContent.toString();
  const parsedMessage = JSON.parse(message);


  if (parsedMessage.action == 'i_got_it') {
    //console.log('CONTEUDO TEXTO: ', parsedMessage.value);
    const contentOfFile = parsedMessage.value;

    fs.writeFile(`build/src/client/${folder}/received`, contentOfFile, (error) => {
      if (error) {
        console.log('Error happened! ', error);
        return error;
      }

      console.log('File received with success!');
    })

  }

  let haveFile = false;

  if (parsedMessage.action == 'i_want_it') {
    console.log(`O usuário em: ${rinfo.address}:${rinfo.port} quer o arquivo com hash: ${parsedMessage.hash}`);
    let filenameToSend;

    availableResources.map(value => {
      if (value.hash == parsedMessage.hash) {
        haveFile = true;
        console.log('Encontrei o arquivo!\n\n');
        filenameToSend = value.name;
      }
    })

    if (haveFile) {
      console.log('Enviando o arquivo...');

      fs.readFile(`build/src/client/${folder}/${filenameToSend}`, (err, content) => {

        console.log('CONTEUDO DO ARQUIVO ', content.toString());

        // const messageBuffer = Buffer.from(content);

        // console.log('CONTEUDO DEPOIS DO BUFFER ', messageBuffer);

        const send = {
          action: 'i_got_it',
          value: content.toString()
        }

        server.send(Buffer.from(JSON.stringify(send)), rinfo.port, rinfo.address, (error) => {
          if (error) throw error
          console.log(`PEER ENVIA`);
        })

      })


    } else {
      console.log('Não encontrei o arquivo... :/\n\n');
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

      const addressAndResources = JSON.stringify({
        ip: `${host}:${port}`,
        resources: availableResources
      });

      const options = {
        hostname: '127.0.0.1',
        port: 8080,
        path: '/peers/register',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': addressAndResources.length
        }
      }

      const responseFromPost = await HttpRequests.post(options, addressAndResources);
      console.log('resposta do post: ', responseFromPost);

      startHeartbeat();
    }

    if (answer == 'resources') {
      console.log('Listando todos os seus recursos...');
      const options = {
        hostname: 'localhost',
        port: '8080',
        path: '/peers',
        method: 'GET'
      }
      const response = await HttpRequests.get(options);

      console.log('Response: ', response);
    }

    if (answer.includes('get')) {

      const splittedAnswer = answer.split(" ");

      const desiredHash = splittedAnswer[1];

      console.log('eu quero o hash: ', desiredHash);

      const options = {
        hostname: 'localhost',
        port: '8080',
        path: '/peers/',
        method: 'GET'
      }

      const responseFromAPI = await HttpRequests.get(options);

      const parsedFromAPI = JSON.parse(responseFromAPI);

      let peerAddress;

      console.log('parsed from API: ', parsedFromAPI);

      // parsedFromAPI.body.map((value, index) => {
      //   value.resources.map((anotherValue, index) => {
      //     console.log('another hash: ', anotherValue.hash);
      //     console.log('desired hash: ', desiredHash);
      //     if (anotherValue.hash === desiredHash) {
      //       //encontrei o arquivo
      //       peerAddress = value.ipAddress;
      //       break;
      //     }
      //   })
      // })

      for (let i = 0; i < parsedFromAPI.body.length; i++) {
        let resources = parsedFromAPI.body[i].resources;
        for (let j = 0; j < resources.length; j++) {
          // console.log('resources[j]: ', resources[j]);
          if (resources[j].hash === desiredHash) {
            peerAddress = parsedFromAPI.body[i].ip;
            break;
          }
          if (peerAddress) {
            break;
          }
        }
      }

      if (peerAddress == undefined) {
        console.log('Não encontrei o peer ou o hash informado. :/\n\n');
      } else {
        console.log('Encontrei o dono do arquivo! Seu endereço: ', peerAddress);
        console.log('Comunicando com ele para obter seu arquivo...');

        const requestFile = {
          action: 'i_want_it',
          hash: desiredHash
        }

        const addressSplitted = peerAddress.split(':');

        // const addressSplitted = '192.168.100.19:8001';

        // console.log(addressSplitted);
        // Tratar a resposta da API e pedir ao ip retornado + o arquivo que bate com o hash informado
        server.send(Buffer.from(JSON.stringify(requestFile)), parseInt(addressSplitted[1]), addressSplitted[0], (error) => {
          if (error) throw error
          console.log('error: ', error)
          console.log(`Servidor responde`);
        });
      }
    }

    recursiveReadLine();
  });
};

recursiveReadLine();