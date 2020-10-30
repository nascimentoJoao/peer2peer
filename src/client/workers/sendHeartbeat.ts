import 'dotenv/config';
import { expose } from 'threads/worker'
const HttpRequests = require('../../../http/HttpRequests');
const fs = require('fs');

expose(async function beat(peerIp, port) {

    while (true) {

        var dateObj = new Date();
        var month = dateObj.getUTCMonth() + 1; //months from 1-12
        var day = dateObj.getUTCDate();
        var year = dateObj.getUTCFullYear();

        const body = JSON.stringify({
            ip: peerIp
        });

        const options = {
            hostname: process.env.SERVER,
            port: 8080,
            path: '/peers/ping',
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': body.length
            }
        }

        let heartbeat;
        let stringToLog = '';

        try {
            heartbeat = await HttpRequests.put(options, body);
            heartbeat = JSON.parse(heartbeat);
            if (heartbeat.code === 204) {
                stringToLog = `[${peerIp}]_fine_at_${new Date()}\n`;
            }
        } catch (err) {
            stringToLog = `[${peerIp}]_error_at_${new Date()}_[traz_cloroquina_pro_pai]\n`
        }

        fs.appendFile(`${year}-${month}-${day}.txt`, stringToLog, { flag: 'a+' }, (error) => {
            if (error) {
                console.log('Error happened! ', error);
                return error;
            }
        })

        await delay(4000);
    }
})

function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}