import { Conversation } from './modules/Conversation';
import { Demand } from './modules/Demand';
import { Identity } from './modules/Identity';
import { Idp } from './modules/Idp';
import { Message } from './modules/Message';
import { Participant } from './modules/Participant';
import { MsgEvtHandler } from './modules/MsgEvtHandler';
import { IBaseConfig } from './modules/interfaces';
import { IDemand } from './modules/interfaces/demand.interface';

/**
 * @desc WebRTC framework to facilitate the development of Applications which seamlessly interoperate with each other
 * This framework is based on @see https://github.com/hypercomm/wonder
 * @author Danny Koppenhagen <mail@d-koppenhagen.de>
 * @author Johannes Hamfler <jh@z7k.de>
 * @desc The WONDER class is used for developers for interacting with all other WONDER related classes.
 * The class uses simple interfaces for login, call, etc.
 * All operations will start with wonder.<function-name> and will return a promise and a callback (either successCallback or errorCallback).
 * @example wonder.<funcion>(<params>).then(function(successCallbackData){<code>}, function(errorCallbackData){<code>})
 */
export class Wonder {
  /**
   * @desc An object with a configuration
   * The standard values are set by default when the user doesn't want to do
   * it on his own.
   * @example
   * {
   *  idp: 'webfinger',
   *  // alternatively an own idp with:
   *  // idp:{ url:  'http://example.com',
   *  //       port: '2222',
   *  //       path: '/u?jsonp=define&identity'   }
   *  autoAccept: false, // accept invitations automatically
   *  ice: [
   *     {urls:'stun:stun.example.com'}, // stunserver
   *     { // turnserver
   *       urls: 'turn:turn.example.org:11111?transport=tcp',
   *       credential: 'credeantialAccessString',
   *       username: 'usernameToAccess'
   *     }
   *   ]
   * }
   */
  config: IBaseConfig;

  /**
   * @desc The conversations used in this WONDER instance
   */
  conversations: Conversation[] = [];

  /**
   * @desc The identity of the local user
   */
  myIdentity: Identity = null;

  /**
   * @desc The local identity provider residing in the local WONDER instance
   * used to interact with the remote identity provider. It is there to be
   * able to abstact the remote identity provider and define a common
   * interface to WONDER functions.
   * It resolves identities via WebFinger or JSONP.
   */
  localIdp: Idp = null;

  /**
   * @desc The variable on which the framework user can register his own message event handler.
   * It is called after the WONDER framework is finished processing each message.
   * Is meant to deliver events which originate from the messaging server.
   * @example wonder.onMessage = function(msg, conversationId) { ... }
   */
  onMessage = new Function();

  /**
   * @desc The variable on which the framework user can register an event handler for wonder rtc (peer connection) events.
   * It is called after the WONDER framework is finished processing each
   * Is meant to deliver events which originate from the peer connection to another user.
   * @example wonder.onRtcEvt = function(msg, conversationId) { ... }
   */
  onRtcEvt = new Function();

  /**
   * @desc The variable on which the framework user can register an event handler for wonder data channel events.
   * It is called after the WONDER framework is finished processing each
   * Is meant to deliver events which originate from the peer connection's datachannels to another user.
   * @example wonder.onDataChannelEvt = function(msg, conversationId){ ... }
   */
   onDataChannelEvt = new Function();

  constructor() {
    this.config = {
      // automatic accept all invitations
      autoAccept: true,

      // location of the identity provider
      idp: 'webfinger', // default value (search for identities with webfinger)

      // default ice servers
      ice: [{
        urls: 'stun:stun.voiparound.com',
      }, {
        urls: 'stun:stun.voipbuster.com'
      }, {
        urls: 'stun:stun.voipstunt.com'
      }, {
        urls: 'stun:stun.voxgratia.org'
      }, {
        urls: 'stun:stun.ekiga.net'
      }, {
        urls: 'stun:stun.schlund.de'
      }, {
        urls: 'stun:stun.iptel.org'
      }, {
        urls: 'stun:stun.l.google.com:19302'
      }, {
        urls: 'stun:stun1.l.google.com:19302'
      }, {
        urls: 'stun:stun.ideasip.com'
      }, {
        urls: 'stun:stun4.l.google.com:19302'
      }, {
        urls: 'stun:stun2.l.google.com:19302'
      }, {
        urls: 'stun:stun3.l.google.com:19302'
      }, {
        urls: 'turn:192.158.29.39:3478?transport=tcp',
        credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
        username: '28224511:1379330808'
      }, {
        urls: 'turn:192.158.29.39:3478?transport=udp',
        credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
        username: '28224511:1379330808'
      }, {
        urls: 'turn:numb.viagenie.ca',
        credential: 'muazkh',
        username: 'webrtc@live.com'
      }]
    };
  }

  /**
   * @desc The function starts a user login at the identity provider.
   * @example
   * wonder.login('alice@example.net', '')
   * .then(function(identity){
   *   // use the identity to extract the user's aliases, avatar or other information
   * });
   */
  login(
    myRtcIdentity: string,
    credentials: { [key: string]: any } | string,
    successCallback?: (identity: Identity) => void,
    errorCallback?: (errorMessage: string) => void
  ): Promise<Identity> {
    const that = this;
    let errMsg = null;

    console.log('[WONDER login] login with:', myRtcIdentity);

    return new Promise((resolve, reject) => {

      // errorCallback handling
      if (!myRtcIdentity) {
        errMsg = new Error('[WONDER login] errorCallback: no login name received');
        reject(errMsg);
        if (errorCallback) { errorCallback(errMsg); }
        return;
      }
      if (credentials === undefined || credentials === null) { credentials = ''; }
      if (!that.localIdp) {
        if (typeof that.config.idp === 'string' && that.config.idp === 'webfinger') {
          console.log('[WONDER login] looking for identities using Webfinger...');
          that.localIdp = new Idp('webfinger', myRtcIdentity);
        } else if (typeof that.config.idp === 'object') {
          that.localIdp = new Idp(that.config.idp.url + ':' + that.config.idp.port + that.config.idp.path, myRtcIdentity);
        } else {
          errMsg = new Error('[WONDER login] errorCallback: Wrong idp format in configuration');
          reject(errMsg);
          if (errorCallback) { errorCallback(errMsg); }
          return;
        }
      }

      that.localIdp.getIdentity(myRtcIdentity, credentials)
        .then((identity: Identity) => {
          console.log('[WONDER login]: got identity: ', identity);
          that.myIdentity = identity;
          const invitationHandler = new MsgEvtHandler(that); // we need to receive invitations
          // as we are registering the handler on the messaging stub we need to replace the reference to
          // this == msgStub with this == invitationHandler
          identity.msgStub.onMessage = invitationHandler.onMessage.bind(invitationHandler);
          // SD 06.10.15: add credentials to the identity
          identity.credentials = credentials;

          identity.msgStub.connect( // and connect to the own mesaging server
            identity.rtcIdentity,
            identity.credentials,
            identity.msgSrv,
            () => { // successCallback connecting
              console.log('[WONDER login] connected to msgServer of identity: ', identity);
              resolve(identity);
              if (successCallback) { successCallback(identity); }
            }
          );

        })
        .catch((err: any) => { // possibly a network errorCallback
          errMsg = new Error(`[WONDER login] ${err}`);
          reject(errMsg);
          if (errorCallback) { errorCallback(errMsg); }
          return;
        });
    });
  }

   /**
    * @desc A function to start a new call.
    * @example
    * wonder.call('bob@example.com', {video: true, data: PayloadType.chat})
    * .then(function(conversationId){
    *   // show video and send chat messages
    * });
    */
  call(
    recipients: string[] | string,
    rawDemand: string | string[] | { [key: string]: any } | Demand,
    conversationId: string,
    successCallback?: (conversationId: string) => void,
    errorCallback?: (errorMessage: string) => void
  ): Promise<string> {
    const that = this;
    let errMsg = null;

    return new Promise((resolve, reject) => {
      // errorCallback handling
      if (!recipients) {
        errMsg = new Error('[WONDER call] no recipients');
        reject(errMsg);
        if (errorCallback) { errorCallback(errMsg); }
        return;
      }
      if (!rawDemand) {
        errMsg = new Error('[WONDER call] no demand');
        reject(errMsg);
        if (errorCallback) { errorCallback(errMsg); }
        return;
      }

      const demand: IDemand = new Demand(rawDemand).converted; // convert the demand to the standard format

      // TODO: only do that if no conversationId is given
      let existingConversation = null;
      if (typeof recipients === 'string' || recipients instanceof String) {
        // check if te remote rtcIdentity is already in a conversation
        existingConversation = that.conversations.filter(
          c => c.remoteParticipants.find(
            p => p.identity.rtcIdentity === recipients
          )
        );
      }
      let conversation = null;

      if (!existingConversation) {
        // create a new conversation
        const participant = new Participant(that, that.myIdentity, demand);
        conversation = new Conversation(that, participant); // create me and set me as the owner
        conversation.myParticipant = conversation.owner; // copy the reference to me
        that.conversations.push(conversation); // add the conversation to wonder
        conversation.myParticipant.setRtcPeerConnection(
          new RTCPeerConnection({
            iceServers: that.config.ice // name of key needs to be iceServers in RTCPeerConnection
          })
        );
      } else {
        conversation = existingConversation;
        conversation.myParticipant.updateDemand(demand);
      }

      // set ice handling to false before receiving all sdp messages to avoid ICE errors
      conversation.msgEvtHandler.ice = false;

      // dynamically load a file for a specific use case
      // require file for a multiparty call
      if (recipients instanceof Array) {
        // TODO: implement multiparty support

        console.error('[wonder call] multiparty no yet implemented');

        if (demand.out.video || demand.out.audio) {
          import('./modules/callMultiple')
            .then((CallMultiple: any) => {
              CallMultiple.call(that, recipients, conversation)
                .then((cId: string) => {
                  resolve(cId);
                  if (successCallback) { successCallback(cId); }
                })
                .catch((error) => {
                  errMsg = new Error(`[WONDER call] Error in callMultiple occured: ${error}`);
                  reject(errMsg);
                  if (errorCallback) { errorCallback(errMsg); }
                  return;
                });
            });
        }
      } else if (typeof recipients === 'string') { // require file for a single call
        // start a video / audio call
        if (demand.out.video || demand.out.audio) {
          const callSingle: typeof import('./modules/callSingle') = require('./modules/callSingle');
          callSingle.CallSingle.call(that, recipients, conversation, demand)
            .then((cId: string) => {
              resolve(cId);
              if (successCallback) { successCallback(cId); }
            })
            .catch((error: any) => {
              errMsg = new Error(`[WONDER call] Error in callSingle occured: ${error}`);
              reject(errMsg);
              if (errorCallback) { errorCallback(errMsg); }
              return;
            });
        }
        // start a data channel
        if (demand.out.data) {
          const dataChannel: typeof import('./modules/DataChannel') = require('./modules/DataChannel');
          // also hand over the data object to tell what payload type is wanted
          dataChannel.DataChannel.establish(that, recipients, conversation, demand.out.data)
          .then((cId: string) => {
            resolve(conversationId);
            if (successCallback) { successCallback(conversationId); }
          })
          .catch((error: any) => {
            errMsg = new Error(`[WONDER call] Error in dataChannel occured: ${error}`);
            reject(errMsg);
            if (errorCallback) { errorCallback(errMsg); }
            return;
          });

        }
      } else {
        errMsg = new Error('[WONDER call] cannot determine wether it is a multi or single party call');
        reject(errMsg);
        if (errorCallback) { errorCallback(errMsg); }
        return;
      }
    });
  }

  /**
   * @desc A function to remove a reciepient from an existing conversation
   * only used for multiparty calls
   */
  removeRecipients(
    recipients: string[] | string,
    conversationId: string,
    successCallback?: (success: boolean) => void,
    errorCallback?: (errorMessage: any) => void
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      // errorCallback handling
      if (!recipients) {
        const errMsg = new Error('[WONDER removeRecipients] errorCallback: no reciepients given');
        reject(errMsg);
        if (errorCallback) { errorCallback(errMsg); }
        return;
      }
      // force an array construct
      let rcpt = [];
      if (typeof recipients === 'string') {
        rcpt.push(recipients);
      } else {
        rcpt = recipients;
      }

      // TODO : implement
      // conversation.addParticipant(participant, invitationBody, constraints, function(){resolve()}, function(){reject()});

    });
  }

  /**
   * @desc Add demand to an existing conversation
   */
  addDemand(
    type: string | string[] | { [key: string]: any } | Demand,
    conversationId: string,
    successCallback?: () => void,
    errorCallback?: (errorMessage: any) => void,
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      // errorCallback handling
      if (!type) {
        const errMsg = new Error('[WONDER addDemand] errorCallback: no type given');
        reject(errMsg);
        if (errorCallback) { errorCallback(errMsg); }
        return;
      }
    });
  }

  /**
   * @desc Remove demand from an existing conversation
   */
  removeDemand(
    type: string | string[] | { [key: string]: any } | Demand,
    conversationId: string,
    successCallback?: () => void,
    errorCallback?: (errorMessage: any) => void,
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      // errorCallback handling
      if (!type) {
        const errMsg = new Error('[WONDER removeDemand] errorCallback: no type given');
        reject(errMsg);
        if (errorCallback) { errorCallback(errMsg); }
        return;
      }
    });
  }

  /**
   * @desc A function to logout a user from his and all other messaging servers.
   * The hangup function will be called to close all conversations.
   */
  logout(successCallback?: (success: boolean) => void, errorCallback?: (errorMessage: string) => void): Promise<boolean> {
    const that = this;
    let errMsg = null;

    return new Promise((resolve, reject) => {
      // errorCallback handling
      if (!that.myIdentity) {
        errMsg = new Error('[WONDER logout] not logged in');
        reject(errMsg);
        if (errorCallback) { errorCallback(errMsg); }
        return;
      }

      // hangup all conversations
      if (that.conversations.length > 0) { that.hangup(); }

      // disconnect from own messaging server
      if (that.myIdentity.msgStub) {
        that.myIdentity.msgStub.disconnect();
      } else {
        errMsg = new Error('[WONDER logout] no messaging Stub present');
        reject(errMsg);
        if (errorCallback) { errorCallback(errMsg); }
        return;
      }

      resolve(true);
      if (successCallback) { successCallback(true); }
    });
  }

  /**
   * @desc A function to hangup a single conversation or all conversations.
   * @example wonder.hangup(conversationId).then( function(){ ... } );
   */
  hangup(
    conversationId?: string,
    successCallback?: (success: boolean) => void,
    errorCallback?: (errorMessage: string) => void
  ): Promise<boolean> {
    const that = this;
    let errMsg = null;

    return new Promise((resolve, reject) => {
      // error handling
      if (that.conversations.length === 0) {
        errMsg = new Error('[WONDER hangup] no conversation present');
        reject(errMsg);
        if (errorCallback) { errorCallback(errMsg); }
      }

      if (!conversationId) { // hangup all conversations
        that.conversations.forEach(c => c.leave());
        that.conversations = [];
      } else { // close a single conversation
        let conversation = that.conversations.find((con) => {
          return con.id === conversationId;
        });
        conversation.leave();
        conversation = null; // TODO: check if a conversation of null is still in the array
      }

      resolve(true);
      if (successCallback) { successCallback(true); }
    });
  }

   /**
    * @desc Sends a new data channel message via the RTCDataChannel.
    * @example
    * msg = 'Text or Message or Object or anything. Is handeled by the codec.';
    * wonder.dataChannelMsg(msg, PayloadType.plain, conversationId)
    * .then(function(booleanValue){
    *   // success
    * });
    */
  dataChannelMsg(
    msg: {},
    type: string,
    conversationId: string,
    to: Identity,
    successCallback?: (successCallback: boolean) => void,
    errorCallback?: (errorMessage: string) => void
  ): Promise<boolean> {
    const that = this;
    let errMsg = null;
    console.log('[WONDER dataChannelMsg] ', msg);
    return new Promise((resolve, reject) => {
      if (that.conversations.length === 0) {
        errMsg = new Error('[WONDER dataChannelMsg] no conversation present');
        reject(errMsg);
        if (errorCallback) { errorCallback(errMsg); }
      }

      // if no conversation use the dafault single party call method
      if (!conversationId) {
        const remoteIdentity = that.conversations[0].remoteParticipants[0].identity;
        try {
          that.conversations[0].dataChannelBroker.getDataChannelCodec(that.myIdentity, remoteIdentity, type)
            .send(msg, that.conversations[0].dataChannelEvtHandler.dataChannel);
          resolve(true);
          if (successCallback) { successCallback(true); }
        } catch (err) {
          errMsg = new Error('[WONDER dataChannelMsg] There is no dataChannel for this Codec established');
          reject(errMsg);
          if (errorCallback) { errorCallback(errMsg); }
        }
      } else { // else find the conversation
        const conversation = that.conversations.find(con => {
          return con.id === conversationId;
        });
        if (conversation) { // and if it was found send the message
          const remoteIdentity = conversation.remoteParticipants[0].identity;
          conversation.dataChannelBroker.getDataChannelCodec(that.myIdentity, remoteIdentity, type)
            .send(msg, conversation.dataChannelEvtHandler.dataChannel);
          resolve(true);
          if (successCallback) { successCallback(true); }
        } else { // and if not throw an error
          errMsg = new Error('[WONDER dataChannelMsg] no conversation found');
          reject(errMsg);
          if (errorCallback) { errorCallback(errMsg); }
        }
      }
    });
  }

  /**
   * @desc This function needs to be called if the autoAccept option in the WONDER instacne is false.
   * It needs to be used after the invitation is received and an answer is necessary.
   * @example
   *   wonder.onMessage = function(msg, conversationId){
   *     switch (msg.type) {
   *       case MessageType.invitation:
   *         if(!wonder.config.autoAccept) {
   *           var confirmDialog = confirm('Call from '+msg.from+'. Would you like to accept?');
   *           if (confirmDialog == true) {
   *               wonder.answerRequest(msg, true).then(function(){
   *                 console.log('[main] Message invitation: user accepted invtitation');
   *               });
   *           } else {
   *               wonder.answerRequest(msg, false).then(function(){
   *                 console.log('[main] Message invitation: user declined invtitation');
   *               });
   *           }
   *       }
   *       break;
   *     }
   *   }
   */
  answerRequest(
    msg: Message,
    action: boolean,
    successCallback: (conversationId: string) => void,
    errorCallback: (errorMessage: string) => void
  ): Promise<string> {
    const that = this;
    let errMsg = null;

    return new Promise((resolve, reject) => {
      const conversation = that.conversations.find(con => {
        return con.id === msg.conversationId;
      }
      );
      if (conversation) { // and if it was found send the message
        conversation.msgEvtHandler.answerRequest(msg, action);
        resolve(conversation.id);
        if (successCallback) { successCallback(conversation.id); }
      } else { // and if not throw an error
        errMsg = new Error('[WONDER answerRequest] no conversation found');
        reject(errMsg);
        if (errorCallback) { errorCallback(errMsg); }
      }
    });
  }

}
