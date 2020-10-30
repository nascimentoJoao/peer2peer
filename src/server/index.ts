import 'dotenv/config';
import express from 'express';
import { PeerController } from './controllers/PeerController';
import { Peer } from './interfaces/Peer';
import { spawn, Thread, Worker } from 'threads';

export class App {

  server : express.Application;
  private static peerList : Peer[];
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
    App.peerList = [];
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

  private async registerWorkers() {
    const heartbeat = await spawn(new Worker("workers/heartbeat"));
    await heartbeat(App.peerList);
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