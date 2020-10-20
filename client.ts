import readLine from 'readline';
import { Worker } from 'worker_threads';

const worker = new Worker('./ping.js');

const server = require('http').createServer();
const io = require('socket.io')(server);

let input = readLine.createInterface({
  input: process.stdin,
  output: process.stdout
});

const port = process.argv[2];
const host = process.argv[1];

io.on('connection', client => {
  client.on('event', data => { console.log(`Oi boi!`, data) });
  client.on('disconnect', () => {console.log('Oi toy!') });
});

server.listen(port, host);

var recursiveReadLine = function() {
  input.question('Command: ', function (answer) {
    if (answer == 'exit')
      return input.close();
    console.log('Encerrando a aplicação!');

    if (answer == 'register') 
    console.log('Registrando seus arquivos...');
    

    if (answer == 'resources') 
    console.log('Listando todos os seus recursos...');
    

    if (answer == 'get') 
    console.log('Você precisa se conectar no IP 192.168.100.1 para obter o recurso X');
    

    recursiveReadLine();
  });
};

recursiveReadLine();