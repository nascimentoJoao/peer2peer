import { expose } from 'threads/worker'
const HttpRequests = require('../http/HttpRequests');

expose(async function beat() {
    while(true) {
        const options = {
            hostname: '127.0.0.1',
            port: '8080',
            path: '/',
            method: 'GET'
          }

        console.log('chegou com sucesso');
        HttpRequests.get(options);

        console.log('nao quebrou aeeee');
        await delay(4000);
    }
})

function delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms));
}