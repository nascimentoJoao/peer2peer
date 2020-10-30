import { expose } from 'threads/worker'
const HttpRequests = require('../../../http/HttpRequests');

expose(async function beat(peerIp) {

    let count = 1;

    while (true) {

        const body = JSON.stringify({
            ip: peerIp
        });

        const options = {
            hostname: 'localhost',
            port: 8080,
            path: '/peers/ping',
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': body.length
            }
        }

        HttpRequests.put(options, body);

        if(count <= 5) {
            console.log('Estou mandando minhas batidas ao servidor. No 5o ping, vou parar de mostrar a mensagem.\n\n')
            console.log(`Ping ${count}.`);
            count++;
        }

        await delay(4000);
    }
})

function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}