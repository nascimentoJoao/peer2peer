import { Router, Request, Response } from 'express';

const router : Router = Router();

/**
 * Returns a list of all avaliable resources and their respective hosts. A query params can be provided in order to retrieve a specific file from a specific host.
 * @param hostIp <string> The resource host's ip address
 * @param resourceId <string> The resource's id
 * @returns A JSON object, containing a list of 
 */
router.get('/', (request: Request, response: Response) => {
  response.send('Hello, World!');
});

/**
 * Registers a new peer into the peer list.
 * 
 */
router.post('/register', (request: Request, response: Response) => {
  response.send('Hello, World!');
});

/**
 * Updates a peer
 */
router.put('/ping', (request: Request, response: Response) => {
  response.send('Hello, World!');
});

export const PeerController : Router = router;