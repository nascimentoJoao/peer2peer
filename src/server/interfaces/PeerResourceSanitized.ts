import { Resource } from "./Resource";

export interface PeerResourceSanitized {
  peerAddress : string,
  resources : Resource[]
}