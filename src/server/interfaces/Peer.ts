import { Resources } from "./Resources";

 export interface Peer {
  ipAddress: string;
  lastPing: Date;
  resources: Resources[]
 } 
  
  