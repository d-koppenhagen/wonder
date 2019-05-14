import { Identity } from './Identity';
import { guid } from './helpfunctions';
import { MessageType } from './Types';

/**
 * @desc This class is a data holder for all messages that are sent between two WONDER implementations.
 * @desc The messages must be in that format when they arrive at another WONDER instance
 * and therefore need to be preserved while being sent through a messaging server.
 * @example var message = new Message(from, to, MessageType.invitation, conversationId, misc);
 */
export class Message {
  /**
   * @desc A unique ID for the message to be able to distinguish messages
   */
  id: string;

  constructor(
    /**
     * @desc The identity from which the message will be or was sent
     */
    public from: Identity,

    /**
     * @desc The target identity or identities to receive the message
     */
    public to: Identity | Identity[],

    /**
     * @desc Type of the message which must be one of the types defined in MessageType
     * @example MessageType.invitation
     */
    public type: MessageType,

    /**
     * @desc The unique id of the conversation, the message is related to
     */
    public conversationId: string,

    /**
     * @desc Additional information related to the type of the message
     * @example { demand: demand,
     *            sessionDescription: sessionDescription }
     */
    public misc?: any
  ) {
    this.id = guid();
  }
}
