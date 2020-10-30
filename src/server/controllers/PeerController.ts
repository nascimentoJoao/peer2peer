import { Router, Request, Response } from 'express';
import { App } from '..';
import { HttpResponse } from '../interfaces/HttpResponse';
import { Peer } from '../interfaces/Peer';
import { PeerPayload } from '../interfaces/PeerPayload';
import { PutPeerPayload } from '../interfaces/PutPeerPayload';
import moment from 'moment';

const router : Router = Router();

/**
 * Returns a list of all avaliable resources and their respective hosts.
 * @returns A JSON object, containing a list of all available resources and their respective hosts
 */
router.get('/', (request: Request, response: Response) => {
  console.log(App.getInstance().peers)
  const peers : PeerPayload[] = [...App.getInstance().peers].map((peer : Peer) => {
    return {
      ip: peer.ipAddress,
      resources: peer.resources
    }
  });
  response.send(<HttpResponse>{code: 200, body: JSON.parse(JSON.stringify(peers))});
});

/**
 * Registers a new peer into the peer list and its resources.
 * @returns The newly added Peer object
 */
router.post('/register', (request: Request, response: Response) => {
  const payload : PeerPayload = request.body;

  const newPeer : Peer = {
    ipAddress: payload.ip,
    lastPing: new Date(),
    resources: payload.resources
  };

  App.getInstance().peers.push(newPeer);
  
  response.send(<HttpResponse>{code: 201, body: JSON.parse(JSON.stringify(newPeer))});
});

/**
 * Updates a peer's last seen alive status. 
 * @returns A HttpResponse object with status code 204
 */
router.put('/ping', (request: Request, response: Response) => {
  const payload : PutPeerPayload = request.body;

  const peer = App.getInstance().peers.find((p : Peer) => p.ipAddress === payload.ip);

  if (!peer) {
    response.send(<HttpResponse>{code: 404, error: `The peer with ip ${payload.ip} does not exist or could not be found.`});
    return;
  }

  peer.lastPing = new Date();

  response.send(<HttpResponse>{code: 204});
});

export const PeerController : Router = router;