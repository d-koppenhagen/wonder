import { Identity } from './Identity';
import { guid } from './helpfunctions';
import { MessageType } from './Types';

export class Message {
  id: string;

  constructor(
    public from: Identity,
    public to: Identity | Identity[],
    public type: MessageType,
    public conversationId: string,
    public misc?: any // string | { RTCIceCandidateInit; demand?: IDemand; sessionDescription?: any }
  ) {
    this.id = guid();
  }
}
