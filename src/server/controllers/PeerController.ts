import { Router, Request, Response } from 'express';
import { App } from '..';
import { Resources } from '../interfaces/Resources';
import { HttpResponse } from '../interfaces/Response';
import { Peer } from '../interfaces/Peer';

const router : Router = Router();

/**
 * Returns a list of all avaliable resources and their respective hosts. A query params can be provided in order to retrieve a specific file from a specific host.
 * @param hostIp <string> The resource host's ip address
 * @param resourceId <string> The resource's id
 * @returns A JSON object, containing a list of 
 */
router.get('/', (request: Request, response: Response) => {
  const hostIp = request.query.hostIp;
  const resourceId = request.query.resourceId;
  const resourceName = request.query.resourceName

  let peersAndResources = App.getInstance().peers;

  if (hostIp || resourceId || resourceName) {
    peersAndResources = App.getInstance().peers.filter((peer : Peer) => {
      return peer.ipAddress === hostIp || peer.resources.find((res : Resources) => res.hash === resourceId) || peer.resources.find((res : Resources) => res.name === resourceName); 
    });
  }
  
  peersAndResources.length
    ? response.send(<HttpResponse>{code: 200, body: JSON.stringify(peersAndResources)})
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