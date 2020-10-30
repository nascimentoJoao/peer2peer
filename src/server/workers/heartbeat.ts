import { expose } from 'threads/worker'
import { Peer } from '../interfaces/Peer';

expose(async function beat(peers: Peer[]) {
    while(true) {
        const stillActive = peers.filter((peer : Peer) => {
            const diffTime = (new Date().getTime() - peer.lastPing.getTime())/1000;
            return diffTime <= 5;
        });
        await delay(4000);
    }
})

function delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms));
}