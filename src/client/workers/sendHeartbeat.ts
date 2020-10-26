import { expose } from 'threads/worker'
const HttpRequests = require('../../../http/HttpRequests');

expose(async function beat(peerIp) {
    while(true) {
        console.log('peer ip: ', peerIp);
        const options = {
            hostname: 'localhost',
            port: '8080',
            path: '/peers/ping',
            method: 'PUT'
          }

          const body = {
              ip: peerIp
          };

        HttpRequests.put(body, options);

        await delay(4000);
    }
})

function delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms));
}