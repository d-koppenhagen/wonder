import { Identity } from './Identity';
import { Message } from './Message';
import { MessageType } from './Types';
import { IDemand } from './interfaces';

/**
 * @desc This class creates WONDER-compliant messages.
 * Please note that all functions in this class are static,
 * so there is no need to create MessageFactory objects.
 */
export class MessageFactory {

  /**
   * @desc Creates an invitation message
   * @example MessageFactory.invitation(from, to, conversationId, demand, sessionDescription);
   */
  static invitation(
    from: Identity,
    to: Identity | Identity[],
    conversationId: string,
    demand: IDemand,
    sessionDescription: {}
  ): Message | Error {
    if (!(from instanceof Identity)) {
      return new Error('[MessageFactory.invitation] from should be an instance of Identity');
    }
    if (!(to instanceof Identity || to instanceof Array && !to.find((i) => {
      return !(i instanceof Identity);
    }))) { return new Error('[MessageFactory.invitation] to should be an instance of Identity or an Array with Identities'); }

    const misc = {
      demand,
      sessionDescription
    };
    return new Message(from, to, MessageType.invitation, conversationId, misc);
  }

  /**
   * @desc Creates a message to accept an invitation
   * @example MessageFactory.accepted(from, to, conversationId, demand, sessionDescription);
   */
  static accepted(
    from: Identity,
    to: Identity | Identity[],
    conversationId: string,
    demand: {},
    sessionDescription: {}
  ): Message | Error {
    if (!(from instanceof Identity)) {
      return new Error('[MessageFactory.accepted] from should be an instance of Identity');
    }
    if (!(to instanceof Identity || to instanceof Array && !to.find((i) => {
      return !(i instanceof Identity);
    }))) {
      return new Error('[MessageFactory.accepted] to should be an instance of Identity or an Array with Identities');
    }

    const misc = {
      demand,
      sessionDescription
    };
    return new Message(from, to, MessageType.accepted, conversationId, misc);
  }

  /**
   * @desc Creates a message to decline an invitation
   * @example MessageFactory.declined(from, to, conversationId);
   */
  static declined(
    from: Identity,
    to: Identity | Identity[],
    conversationId: string
  ): Message | Error {
    console.log(from, to, conversationId);
    if (!(from instanceof Identity)) {
      return new Error('[MessageFactory.declined] from should be an instance of Identity');
    }
    if (!(to instanceof Identity || to instanceof Array && !to.find((i) => {
      return !(i instanceof Identity);
    }))) {
      return new Error('[MessageFactory.declined] to should be an instance of Identity or an Array with Identities');
    }

    return new Message(from, to, MessageType.declined, conversationId);
  }

  /**
   * @desc Creates a message to end a conversation
   * @example MessageFactory.bye(from, to, conversationId);
   */
  static bye(
    from: Identity,
    to: Identity | Identity[],
    conversationId: string
  ): Message | Error {
    if (!(from instanceof Identity)) {
      return new Error('[MessageFactory.bye] from should be an instance of Identity');
    }
    if (!(to instanceof Identity || to instanceof Array && !to.find((i) => {
      return !(i instanceof Identity);
    }))) {
      return new Error('[MessageFactory.bye] to should be an instance of Identity or an Array with Identities');
    }

    return new Message(from, to, MessageType.bye, conversationId);
  }

  /**
   * @desc Creates a message containing the new demand
   * @TODO use it in the communication
   */
  static updateDemand(
    from: Identity,
    to: Identity | Identity[],
    conversationId: string,
    demand: {}
  ): Message | Error {
    if (!(from instanceof Identity)) {
      return new Error('[MessageFactory.updateDemand] from should be an instance of Identity');
    }
    if (!(to instanceof Identity || to instanceof Array && !to.find((i) => {
      return !(i instanceof Identity);
    }))) {
      return new Error('[MessageFactory.updateDemand] to should be an instance of Identity or an Array with Identities');
    }
    const misc = {
      demand,
    };
    return new Message(from, to, MessageType.update, conversationId, misc);
  }

  /**
   * @desc Creates an message to update ICE candidates of a peer connection
   * @example MessageFactory.updateIceCandidates(from, to, conversationId, iceCandidates);
   */
  static updateIceCandidates(
    from: Identity,
    to: Identity | Identity[],
    conversationId: string,
    iceCandidates: {}
  ): Message | Error {
    if (!(from instanceof Identity)) {
      return new Error('[MessageFactory.updateIceCandidates] from should be an instance of Identity');
    }
    if (!(to instanceof Identity || to instanceof Array && !to.find((i) => {
      return !(i instanceof Identity);
    }))) {
      return new Error('[MessageFactory.updateIceCandidates] to should be an instance of Identity or an Array with Identities');
    }

    return new Message(from, to, MessageType.connectivityCandidate, conversationId, iceCandidates);
  }

  /**
   * @desc Creates a message containing the new session description
   * @example MessageFactory.updateSdp(from, to, conversationId, sdp);
   */
  static updateSdp(
    from: Identity,
    to: Identity | Identity[],
    conversationId: string,
    sdp: {}
  ): Message | Error {
    if (!(from instanceof Identity)) {
      return new Error('[MessageFactory.updateDemand] from should be an instance of Identity');
    }
    if (!(to instanceof Identity || to instanceof Array && !to.find((i) => {
      return !(i instanceof Identity);
    }))) {
      return new Error('[MessageFactory.updateDemand] to should be an instance of Identity or an Array with Identities');
    }
    const misc = {
      sdp,
    };
    return new Message(from, to, MessageType.updateSdp, conversationId, misc);
  }

  /**
   * @desc Creates a message to announce the current presence status
   * @example MessageFactory.presence(from, to, conversationId, status);
   * @TODO use it in the communication
   */
  static presence(
    from: Identity,
    to: Identity | Identity[],
    conversationId: string,
    status: string
  ): Message | Error {
    if (!(from instanceof Identity)) {
      return new Error('[MessageFactory.presence] from should be an instance of Identity');
    }
    if (!(to instanceof Identity || to instanceof Array && !to.find((i) => {
      return !(i instanceof Identity);
    }))) {
      return new Error('[MessageFactory.presence] to should be an instance of Identity or an Array with Identities');
    }
    const misc = {
      status,
    };
    return new Message(from, to, MessageType.presence, conversationId, misc);
  }

}
