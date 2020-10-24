import { Router, Request, Response } from 'express';
import { App } from '..';
import { HttpResponse } from '../interfaces/HttpResponse';

const router : Router = Router();

/**
 * Returns a list of all avaliable resources and their respective hosts.
 * @returns A JSON object, containing a list of all available resources and their respective hosts
 */
router.get('/', (request: Request, response: Response) => {
  const peers = [...App.getInstance().peers];
  response.send(<HttpResponse>{code: 200, body: JSON.parse(JSON.stringify(peers))});
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