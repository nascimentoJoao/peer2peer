import { Resource } from "./Resource";

export interface PeerPayload {
  ip: string,
  resources: Resource[]
}