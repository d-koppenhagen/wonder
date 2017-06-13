import { Identity } from './Identity';
import { guid } from './helpfunctions';

export class Message {
  id: string;

  constructor(
    public from: Identity,
    public to: Identity|Array<Identity>,
    public type: string,
    public conversationId: string,
    public misc?: { demand?; sessionDescription? }
  ) {
    this.id = guid();
  }
}
