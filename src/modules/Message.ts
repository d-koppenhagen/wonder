import { Identity } from './Identity';
import { guid } from './helpfunctions';
import { IDemand } from './interfaces';

export class Message {
  id: string;

  constructor(
    public from: Identity,
    public to: Identity|Array<Identity>,
    public type: string,
    public conversationId: string,
    public misc?: any // String | { RTCIceCandidateInit; demand?: IDemand; sessionDescription?: any }
  ) {
    this.id = guid();
  }
}
