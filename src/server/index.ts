import 'dotenv/config';
import express from 'express';
import { PeerController } from './controllers/PeerController';
import { Worker } from 'worker_threads';
import { Peer } from './interfaces/Peer';
import { PeerEvents } from './enums/PeerEvents.enum';

export class App {

  server : express.Application;
  private worker : Worker;
  private static peerList : Peer[] = [
    {
      ipAddress: "127.0.0.1:9032",
      lastPing: new Date(),
      resources: [
        {
          name: "Mortau Combati",
          hash: "ADWASDBAWD23123o3912lf231"
        }
      ]
    },
    {
      ipAddress: "192.168.1.1:4001",
      lastPing: new Date(),
      resources: [
        {
          name: "GTA Rio de Janeiro",
          hash: "dw9923kjglskdnflje23"
        },
        {
          name: "Kid_Bengala_007",
          hash: "a12345678"
        }
      ]
    }
  ];
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
    return App.peerList; 
  }

  set peers(newPeers : Peer[]) {
    App.peerList = newPeers;
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