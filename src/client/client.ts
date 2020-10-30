import 'dotenv/config';
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
  await heartbeatFunction(`${host}:${port}`, `${port}`);
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

    fs.writeFile(`build/src/client/${folder}/${parsedMessage.name}`, contentOfFile, (error) => {
      if (error) {
        console.log('Error happened! ', error);
        return error;
      }

      console.log(`\n\nArquivo recebido! Você pode acessá-lo em: build/src/client/${folder}/${parsedMessage.name}`);
      console.log(`\n\nAgora você é um peer que fornece o arquivo ${parsedMessage.name}!`);
    })

    generateResourcesAndHashes();
    register();
  }

  let haveFile = false;

  if (parsedMessage.action == 'i_want_it') {
    console.log(`\n\nO usuário em: ${rinfo.address}:${rinfo.port} quer o arquivo com hash: ${parsedMessage.hash}`);
    let filenameToSend;

    availableResources.map(value => {
      if (value.hash == parsedMessage.hash) {
        haveFile = true;
        filenameToSend = value.name;
      }
    })

    if (haveFile) {
      console.log('Enviando o arquivo...');

      fs.readFile(`build/src/client/${folder}/${filenameToSend}`, (err, content) => {

        const send = {
          action: 'i_got_it',
          name: filenameToSend,
          value: content.toString()
        }

        server.send(Buffer.from(JSON.stringify(send)), rinfo.port, rinfo.address, (error) => {
          if (error) {
            console.log(`Erro ao enviar arquivo. Erro: ${error}`);
            throw error
          } else {
            console.log(`\n\nArquivo enviado com sucesso!`);
          }
        })

      })
    } else {
      console.log('\n\nNão encontrei o arquivo... :/');
    }

    haveFile = false;
  }
});

const register = async () => {
  console.log('\nRegistrando seus arquivos...');

  const addressAndResources = JSON.stringify({
    ip: `${host}:${port}`,
    resources: availableResources
  });

  const options = {
    hostname: process.env.SERVER,
    port: 8080,
    path: '/peers/register',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': addressAndResources.length
    }
  }
  try {
    await HttpRequests.post(options, addressAndResources);
    console.log('\n\nPeer registrado com sucesso!');
    console.log(`\nVerifique o arquivo de log na raíz do projeto e veja o status do heartbeat.\n\n`);
    startHeartbeat();
  } catch (e) {
    console.log('\n\nNão consegui registrar os arquivos. Tente novamente...\n')
  }
}

console.log('##### INICIANDO PEER #####\nDigite um dos comandos:\
\n\nexit: encerra o peer\nregister: registra o peer e seus arquivos\nresources: retorna os recursos e seus respectivos peers\
\nget <ip:port> <file>: inicia a transferência do arquivo para sua respectiva pasta\n\n')

generateResourcesAndHashes();

var recursiveReadLine = function () {

  input.question('Digite a opção desejada: \n\n', async function (answer) {
    if (answer.toLowerCase() == 'exit') {
      console.log('Encerrando a aplicação!');
      return input.close();
    }

    if (answer.toLowerCase() == 'register') {
      await register();
    }

    if (answer.toLowerCase() == 'resources') {
      console.log('Listando os recursos disponíveis:');
      const options = {
        hostname: process.env.SERVER,
        port: '8080',
        path: '/peers',
        method: 'GET'
      }

      let response;

      try {
        response = await HttpRequests.get(options);
      } catch (err) { }

      response = JSON.parse(response);

      const formattedText: any = [];

      response.body.map((value, index) => {
        value.resources.map((innerValue, innerIndex) => {
          let object = { id: index, IP: value.ip, NOME: `${innerValue.name}`, MD5SUM: `${innerValue.hash}` };
          formattedText.push(object);
        })
      });

      console.table(formattedText);
    }

    if (answer.toLowerCase().includes('get')) {

      const splittedAnswer = answer.split(" ");

      const desiredHash = splittedAnswer[1];

      console.log('Tentando buscar arquivo com o hash: ', desiredHash);

      const options = {
        hostname: process.env.SERVER,
        port: '8080',
        path: '/peers/',
        method: 'GET'
      }

      let responseFromAPI

      try {
        responseFromAPI = await HttpRequests.get(options);

        const parsedFromAPI = JSON.parse(responseFromAPI);

        let peerAddress;
  
        for (let i = 0; i < parsedFromAPI.body.length; i++) {
          let resources = parsedFromAPI.body[i].resources;
          for (let j = 0; j < resources.length; j++) {
            if (resources[j].hash === desiredHash) {
              peerAddress = parsedFromAPI.body[i].ip;
              break;
            }
            if (peerAddress) {
              break;
            }
          }
        }

        if (peerAddress == `${host}:${port}`) {
          console.log('Ei, esse arquivo é seu!\n');
        } else if (peerAddress == undefined) {
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
            if (error) {
              console.log(`Erro ao solicitar arquivo! Erro: ${error}`)
              throw error;
            } else {
              console.log(`Solicitação enviada. Aguardando...`);
            }
          });
        }

      } catch (error) {
        console.log('Não consegui retornar nada do servidor.\n\n');
      }
    }

    recursiveReadLine();
  });
};

recursiveReadLine();