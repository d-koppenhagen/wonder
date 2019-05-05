import { Identity } from './Identity';
import { guid } from './helpfunctions';

export class Message {
  id: string;

  constructor(
    public from: Identity,
    public to: Identity|Identity[],
    public type: string,
    public conversationId: string,
    public misc?: any // string | { RTCIceCandidateInit; demand?: IDemand; sessionDescription?: any }
  ) {
    this.id = guid();
  }
}
