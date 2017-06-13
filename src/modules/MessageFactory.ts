import { Identity } from './Identity';
import { Message } from './Message';
import { MessageType } from './Types';
import { guid } from './helpfunctions';

export class MessageFactory {
  static invitation(
    from: Identity,
    to: Identity | Array<Identity>,
    conversationId: string,
    demand: Object,
    sessionDescription: Object
  ): Message | Error {
    if (!(from instanceof Identity)) {
      return new Error('[MessageFactory.invitation] from should be an instance of Identity');
    }
    if (!(to instanceof Identity || to instanceof Array && !to.find(function (i) {
      return !(i instanceof Identity)
    }))) { return new Error('[MessageFactory.invitation] to should be an instance of Identity or an Array with Identities'); }
    if (!(typeof conversationId === 'string' || conversationId instanceof String)) {
      return new Error('[MessageFactory.invitation] conversationId should be a string');
    }
    if (!(typeof demand === 'object' || demand instanceof Object)) {
      return new Error('[MessageFactory.invitation] demand should be an object');
    }

    const misc = {
      'demand': demand,
      'sessionDescription': sessionDescription
    }
    return new Message(from, to, MessageType.invitation, conversationId, misc);
  }

  static accepted(
    from: Identity,
    to: Identity | Array<Identity>,
    conversationId: string,
    demand: Object,
    sessionDescription: Object
  ): Message | Error {
    if (!(from instanceof Identity)) {
      return new Error('[MessageFactory.accepted] from should be an instance of Identity');
    }
    if (!(to instanceof Identity || to instanceof Array && !to.find(function (i) {
      return !(i instanceof Identity)
    }))) {
      return new Error('[MessageFactory.accepted] to should be an instance of Identity or an Array with Identities');
    }
    if (!(typeof conversationId === 'string' || conversationId instanceof String)) {
      return new Error('[MessageFactory.accepted] conversationId should be a string');
    }
    if (!(typeof demand === 'object' || demand instanceof Object)) {
      return new Error('[MessageFactory.accepted] demand should be an object');
    }

    const misc = {
      'demand': demand,
      'sessionDescription': sessionDescription
    }
    return new Message(from, to, MessageType.accepted, conversationId, misc);
  }

  static declined(
    from: Identity,
    to: Identity | Array<Identity>,
    conversationId: string
  ): Message | Error {
    console.log(from, to, conversationId);
    if (!(from instanceof Identity)) {
      return new Error('[MessageFactory.declined] from should be an instance of Identity');
    }
    if (!(to instanceof Identity || to instanceof Array && !to.find(function (i) {
      return !(i instanceof Identity)
    }))) {
      return new Error('[MessageFactory.declined] to should be an instance of Identity or an Array with Identities');
    }
    if (!(typeof conversationId === 'string' || conversationId instanceof String)) {
      return new Error('[MessageFactory.declined] conversationId should be a string');
    }

    return new Message(from, to, MessageType.declined, conversationId);
  }

  static bye(
    from: Identity,
    to: Identity | Array<Identity>,
    conversationId: string
  ): Message | Error {
    if (!(from instanceof Identity)) {
      return new Error('[MessageFactory.bye] from should be an instance of Identity');
    }
    if (!(to instanceof Identity || to instanceof Array && !to.find(function (i) {
      return !(i instanceof Identity)
    }))) {
      return new Error('[MessageFactory.bye] to should be an instance of Identity or an Array with Identities');
    }
    if (!(typeof conversationId === 'string' || conversationId instanceof String)) {
      return new Error('[MessageFactory.bye] conversationId should be a string');
    }

    return new Message(from, to, MessageType.bye, conversationId);
  }

  static updateConstraints(
    from: Identity,
    to: Identity | Array<Identity>,
    conversationId: string,
    demand: Object
  ): Message | Error {
    if (!(from instanceof Identity)) {
      return new Error('[MessageFactory.updateConstraints] from should be an instance of Identity');
    }
    if (!(to instanceof Identity || to instanceof Array && !to.find(function (i) {
      return !(i instanceof Identity)
    }))) {
      return new Error('[MessageFactory.updateConstraints] to should be an instance of Identity or an Array with Identities');
    }
    if (!(typeof conversationId === 'string' || conversationId instanceof String)) {
      return new Error('[MessageFactory.updateConstraints] conversationId should be a string');
    }
    if (!(typeof demand === 'object' || demand instanceof Object)) {
      return new Error('[MessageFactory.updateConstraints] demand should be an object');
    }
    const misc = {
      'demand': demand,
    }
    return new Message(from, to, MessageType.update, conversationId, misc);
  }

  static updateIceCandidates(
    from: Identity,
    to: Identity | Array<Identity>,
    conversationId: string,
    iceCandidates: Object
  ): Message | Error {
    if (!(from instanceof Identity)) {
      return new Error('[MessageFactory.updateIceCandidates] from should be an instance of Identity');
    }
    if (!(to instanceof Identity || to instanceof Array && !to.find(function (i) {
      return !(i instanceof Identity)
    }))) {
      return new Error('[MessageFactory.updateIceCandidates] to should be an instance of Identity or an Array with Identities');
    }
    if (!(typeof conversationId === 'string' || conversationId instanceof String)) {
      return new Error('[MessageFactory.updateIceCandidates] conversationId should be a string');
    }

    return new Message(from, to, MessageType.connectivityCandidate, conversationId, iceCandidates);
  }

  static updateSdp(
    from: Identity,
    to: Identity | Array<Identity>,
    conversationId: string,
    sdp: Object
  ): Message | Error {
    if (!(from instanceof Identity)) {
      return new Error('[MessageFactory.updateConstraints] from should be an instance of Identity');
    }
    if (!(to instanceof Identity || to instanceof Array && !to.find(function (i) {
      return !(i instanceof Identity)
    }))) {
      return new Error('[MessageFactory.updateConstraints] to should be an instance of Identity or an Array with Identities');
    }
    if (!(typeof conversationId === 'string' || conversationId instanceof String)) {
      return new Error('[MessageFactory.updateConstraints] conversationId should be a string');
    }
    const misc = {
      'sdp': sdp,
    }
    return new Message(from, to, MessageType.updateSdp, conversationId, misc);
  }

  static presence(
    from: Identity,
    to: Identity | Array<Identity>,
    conversationId: string,
    status: string
  ): Message | Error {
    if (!(from instanceof Identity)) {
      return new Error('[MessageFactory.presence] from should be an instance of Identity');
    }
    if (!(to instanceof Identity || to instanceof Array && !to.find(function (i) {
      return !(i instanceof Identity)
    }))) {
      return new Error('[MessageFactory.presence] to should be an instance of Identity or an Array with Identities');
    }
    if (!(typeof conversationId === 'string' || conversationId instanceof String)) {
      return new Error('[MessageFactory.presence] conversationId should be a string');
    }

    return new Message(from, to, MessageType.presence, conversationId);
  }

}
