import { Resource } from "./Resource";

 export interface Peer {
  ipAddress: string;
  lastPing: Date;
  resources: Resource[]
 } 
  
  