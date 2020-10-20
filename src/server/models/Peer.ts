import { Resources } from "../interfaces/Resources";

export class Peer {
  private ipAddress: string;
  private lastPing: Date;
  private resources: Resources[]

  get peerIpAddress(): string {
    return this.ipAddress;
  }

  get lastSeenAlive() : Date {
    return this.lastPing;
  }

  get peerResources() : Resources[] {
    return this.resources;
  }
}