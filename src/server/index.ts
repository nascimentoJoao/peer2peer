import 'dotenv/config';
import express from 'express';
import { PeerController } from './controllers/PeerController';
import { Worker } from 'worker_threads';
import { Peer } from './models/Peer';
import { PeerEvents } from './enums/PeerEvents.enum';

export class App {

  server : express.Application;
  private worker : Worker;
  private peerList : Peer[];
  private static instance : App;

  static getInstance() : App {
    if (!this.instance) {
      this.instance = new App();
    }
    return this.instance;
  }

  private constructor() {
    this.server = express();
    this.registerMiddlewares();
    this.registerRoutes();
    this.registerWorkers();
    this.listen();
  }

  get peers() : Peer[] {
    return this.peerList; 
  }

  set peers(newPeers : Peer[]) {
    this.peerList = newPeers;
  }

  private registerMiddlewares() {
    this.server.use(express.json());
  }

  private registerWorkers() {
    // this.worker = new Worker('./workers.js', {
    //   workerData: {
    //     path: './workers/heartbeat.ts'
    //   }
    // });
    // this.registerWorkerListeners();
  }

  private registerWorkerListeners() {
    this.worker.addListener(PeerEvents.PEER_NOT_RESPONDING, () => {
      console.log(`PEER IS NOT RESPONDING. SHOULD BE REMOVED FROM THE LIST.`) 
    });
  }

  private registerRoutes() {
    this.server.use('/peers', PeerController);
  }

  private listen() {
    const port = process.env.PORT;
    this.server.listen(port, () => {
      console.log(`Server listening on port ${port}`);
    })
  }
}

App.getInstance();