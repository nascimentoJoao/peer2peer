import { Router, Request, Response } from 'express';
import { App } from '..';
import { Resource } from '../interfaces/Resource';
import { HttpResponse } from '../interfaces/HttpResponse';
import { Peer } from '../interfaces/Peer';
import { PeerResourceSanitized } from '../interfaces/PeerResourceSanitized';

const router : Router = Router();

/**
 * Returns a list of all avaliable resources and their respective hosts. A query params can be provided in order to retrieve a specific file from a specific host.
 * @param hostIp <string> The resource host's ip address
 * @param resourceId <string> The resource's id
 * @returns A JSON object, containing a list of 
 */
router.get('/', (request: Request, response: Response) => {
  const address = request.query.address;
  const hash = request.query.hash;
  const name = request.query.name

  let peers = [...App.getInstance().peers];
  
  let resp = peers.map((peer : Peer) => {
    return {
      peerAddress: peer.ipAddress,
      resources: peer.resources
    }
  });

  if (address) {
    resp = resp.filter((item : PeerResourceSanitized) => item.peerAddress === address);
  }

  if (hash) {
    resp.forEach((item : PeerResourceSanitized) => {
      item.resources = item.resources.filter((res : Resource) => res.hash === hash);
    });
  }

  if (name) {
    resp.forEach((item : PeerResourceSanitized) => {
      item.resources = item.resources.filter((res : Resource) => res.name === name);
    });
  }
  
  resp.length
    ? response.send(<HttpResponse>{code: 200, body: JSON.parse(JSON.stringify(resp))})
    : response.send(<HttpResponse>{code: 404, error: 'O recurso buscado não existe.'});
  
});

/**
 * Registers a new peer into the peer list.
 * @returns 
 */
router.post('/register', (request: Request, response: Response) => {
  response.send('Hello, World!');
});

/**
 * Updates a peer's last seen alive status. 
 * @returns 
 */
router.put('/ping', (request: Request, response: Response) => {
  response.send('Hello, World!');
});

export const PeerController : Router = router;