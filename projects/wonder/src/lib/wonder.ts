import { Conversation } from './modules/Conversation';
import { Demand } from './modules/Demand';
import { Identity } from './modules/Identity';
import { Idp } from './modules/Idp';
import { Message } from './modules/Message';
import { Participant } from './modules/Participant';
import { MsgEvtHandler } from './modules/MsgEvtHandler';
import { IBaseConfig } from './modules/interfaces';
import { IDemand } from './modules/interfaces/demand.interface';
import { errorHandler } from './modules/helpfunctions';

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
  async login(
    myRtcIdentity: string,
    credentials: { [key: string]: any } | string,
    successCallback?: (identity: Identity) => void,
    errorCallback?: (errorMessage: string) => void
  ): Promise<Identity> {
    let errMsg = '';

    console.log('[WONDER login] login with:', myRtcIdentity);

    // errorCallback handling
    if (!myRtcIdentity) {
      errMsg = '[WONDER login] errorCallback: no login name received';
      console.error(errMsg);
      errorHandler(errMsg, errorCallback);
      return;
    }
    if (!credentials) { credentials = ''; }
    if (!this.localIdp) {
      if (this.config.idp === 'webfinger') {
        console.log('[WONDER login] looking for identities using Webfinger...');
        this.localIdp = new Idp('webfinger', myRtcIdentity);
      } else if (typeof this.config.idp === 'object') {
        this.localIdp = new Idp(this.config.idp.url + ':' + this.config.idp.port + this.config.idp.path, myRtcIdentity);
      } else {
        errMsg = '[WONDER login] errorCallback: Wrong idp format in configuration';
        errorHandler(errMsg, errorCallback);
      }
    }

    this.localIdp.getIdentity(myRtcIdentity, credentials)
      .then((identity: Identity) => {
        console.log('[WONDER login]: got identity: ', identity);
        this.myIdentity = identity;
        const invitationHandler = new MsgEvtHandler(this); // we need to receive invitations
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
            if (successCallback) {
              successCallback(identity);
            }
            return identity;
          }
        );
      })
      .catch((err: any) => { // possibly a network errorCallback
        errMsg = `[WONDER login] ${err}`;
        errorHandler(errMsg, errorCallback);
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
  async call(
    recipients: string[] | string,
    rawDemand: string | string[] | { [key: string]: any } | Demand,
    conversationId: string,
    successCallback?: (conversationId: string) => void,
    errorCallback?: (errorMessage: string) => void
  ): Promise<string> {
    let errMsg = null;

    // errorCallback handling
    if (!recipients) {
      errMsg = '[WONDER call] no recipients';
      errorHandler(errMsg, errorCallback);
      return;
    }
    if (!rawDemand) {
      errMsg = new Error('[WONDER call] no demand');
      errorHandler(errMsg, errorCallback);
      return;
    }

    const demand: IDemand = new Demand(rawDemand).converted; // convert the demand to the standard format

    // TODO: only do this if no conversationId is given
    let existingConversation = null;
    if (typeof recipients === 'string' || recipients instanceof String) {
      // check if te remote rtcIdentity is already in a conversation
      existingConversation = this.conversations.filter(
        c => c.remoteParticipants.find(
          p => p.identity.rtcIdentity === recipients
        )
      );
    }
    let conversation = null;

    if (!existingConversation) {
      // create a new conversation
      const participant = new Participant(this, this.myIdentity, demand);
      conversation = new Conversation(this, participant); // create me and set me as the owner
      conversation.myParticipant = conversation.owner; // copy the reference to me
      this.conversations.push(conversation); // add the conversation to wonder
      conversation.myParticipant.setRtcPeerConnection(
        new RTCPeerConnection({
          iceServers: this.config.ice // name of key needs to be iceServers in RTCPeerConnection
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
      errorHandler('[wonder call] multiparty no yet implemented');
      return;
      if (demand.out.video || demand.out.audio) {
        import('./modules/callMultiple')
          .then((CallMultiple: any) => {
            return CallMultiple.call(this, recipients, conversation);
          })
          .then((cId: string) => {
            if (successCallback) { successCallback(cId); }
            return cId;
          })
          .catch((error) => {
            errMsg = new Error(`[WONDER call] Error in callMultiple occured: ${error}`);
            errorHandler(errMsg, errorCallback);
            return;
          });
      }
    } else if (typeof recipients === 'string') { // require file for a single call
      // start a video / audio call
      if (demand.out.video || demand.out.audio) {
        const callSingle: typeof import('./modules/callSingle') = require('./modules/callSingle');
        callSingle.CallSingle
          .call(this, recipients, conversation, demand)
          .then((cId: string) => {
            if (successCallback) { successCallback(cId); }
            return cId;
          })
          .catch((error: any) => {
            errMsg = new Error(`[WONDER call] Error in callSingle occured: ${error}`);
            errorHandler(errMsg, errorCallback);
            return;
          });
      }
      // start a data channel
      if (demand.out.data) {
        const dataChannel: typeof import('./modules/DataChannel') = require('./modules/DataChannel');
        // also hand over the data object to tell what payload type is wanted
        dataChannel.DataChannel
          .establish(this, recipients, conversation, demand.out.data)
          .then((cId: string) => {
            if (successCallback) { successCallback(conversationId); }
            return conversationId;
          })
          .catch((error: any) => {
            errMsg = new Error(`[WONDER call] Error in dataChannel occured: ${error}`);
            errorHandler(errMsg, errorCallback);
            return;
          });
      }
    } else {
      errMsg = new Error('[WONDER call] cannot determine wether it is a multi or single party call');
      errorHandler(errMsg, errorCallback);
      return;
    }

  }

  /**
   * @desc A function to remove a reciepient from an existing conversation
   * only used for multiparty calls
   */
  async removeRecipients(
    recipients: string[] | string,
    conversationId: string,
    successCallback?: (success: boolean) => void,
    errorCallback?: (errorMessage: any) => void
  ): Promise<string> {
    // errorCallback handling
    if (!recipients) {
      const errMsg = new Error('[WONDER removeRecipients] errorCallback: no reciepients given');
      errorHandler(errMsg, errorCallback);
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
  }

  /**
   * @desc Add demand to an existing conversation
   */
  async addDemand(
    type: string | string[] | { [key: string]: any } | Demand,
    conversationId: string,
    successCallback?: () => void,
    errorCallback?: (errorMessage: any) => void,
  ): Promise<string> {
    // errorCallback handling
    if (!type) {
      const errMsg = new Error('[WONDER addDemand] errorCallback: no type given');
      errorHandler(errMsg, errorCallback);
      return;
    }
  }

  /**
   * @desc Remove demand from an existing conversation
   */
  async removeDemand(
    type: string | string[] | { [key: string]: any } | Demand,
    conversationId: string,
    successCallback?: () => void,
    errorCallback?: (errorMessage: any) => void,
  ): Promise<string> {
    // errorCallback handling
    if (!type) {
      const errMsg = new Error('[WONDER removeDemand] errorCallback: no type given');
      errorHandler(errMsg, errorCallback);
      return;
    }
  }

  /**
   * @desc A function to logout a user from his and all other messaging servers.
   * The hangup function will be called to close all conversations.
   */
  async logout(
    successCallback?: (success: boolean) => void,
    errorCallback?: (errorMessage: string) => void
  ): Promise<boolean> {
    let errMsg = null;

    // errorCallback handling
    if (!this.myIdentity) {
      errMsg = new Error('[WONDER logout] not logged in');
      errorHandler(errMsg, errorCallback);
      return;
    }

    // hangup all conversations
    if (this.conversations.length > 0) {
      await this.hangup();
    }

    // disconnect from own messaging server
    if (this.myIdentity.msgStub) {
      this.myIdentity.msgStub.disconnect();
    } else {
      errMsg = new Error('[WONDER logout] no messaging Stub present');
      errorHandler(errMsg, errorCallback);
      return;
    }

    if (successCallback) { successCallback(true); }
    return true;
  }

  /**
   * @desc A function to hangup a single conversation or all conversations.
   * @example wonder.hangup(conversationId).then( function(){ ... } );
   */
  async hangup(
    conversationId?: string,
    successCallback?: (success: boolean) => void,
    errorCallback?: (errorMessage: string) => void
  ): Promise<boolean> {
    let errMsg = null;

    // error handling
    if (this.conversations.length === 0) {
      errMsg = new Error('[WONDER hangup] no conversation present');
      errorHandler(errMsg, errorCallback);
      return false;
    }

    if (!conversationId) { // hangup all conversations
      this.conversations.forEach(c => c.leave());
      this.conversations = [];
    } else { // close a single conversation
      let conversation = this.conversations.find((con) => {
        return con.id === conversationId;
      });
      conversation.leave();
      conversation = null;
    }

    if (successCallback) { successCallback(true); }
    return true;
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
  async dataChannelMsg(
    msg: {},
    type: string,
    conversationId: string,
    to: Identity,
    successCallback?: (successCallback: boolean) => void,
    errorCallback?: (errorMessage: string) => void
  ): Promise<boolean> {
    let errMsg = null;

    if (this.conversations.length === 0) {
      errMsg = new Error('[WONDER dataChannelMsg] no conversation present');
      errorHandler(errMsg, errorCallback);
      return false;
    }

    // if no conversation use the dafault single party call method
    if (!conversationId) {
      const remoteIdentity = this.conversations[0].remoteParticipants[0].identity;
      try {
        this.conversations[0].dataChannelBroker
          .getDataChannelCodec(this.myIdentity, remoteIdentity, type)
          .send(msg, this.conversations[0].dataChannelEvtHandler.dataChannel);
        if (successCallback) { successCallback(true); }
        return true;
      } catch (err) {
        errMsg = new Error('[WONDER dataChannelMsg] There is no dataChannel for this Codec established');
        errorHandler(errMsg, errorCallback);
      }
    } else { // else find the conversation
      const conversation = this.conversations.find(con => {
        return con.id === conversationId;
      });
      if (conversation) { // and if it was found send the message
        const remoteIdentity = conversation.remoteParticipants[0].identity;
        conversation.dataChannelBroker
          .getDataChannelCodec(this.myIdentity, remoteIdentity, type)
          .send(msg, conversation.dataChannelEvtHandler.dataChannel);
        if (successCallback) { successCallback(true); }
        return true;
      } else { // and if not throw an error
        errMsg = new Error('[WONDER dataChannelMsg] no conversation found');
        errorHandler(errMsg, errorCallback);
      }
    }
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
  async answerRequest(
    msg: Message,
    action: boolean,
    successCallback: (conversationId: string) => void,
    errorCallback: (errorMessage: string) => void
  ): Promise<string> {
    let errMsg = null;

    const conversation = this.conversations.find(con => {
      return con.id === msg.conversationId;
    });

    if (conversation) { // and if it was found send the message
      conversation.msgEvtHandler.answerRequest(msg, action);
      if (successCallback) { successCallback(conversation.id); }
      return conversation.id;
    } else { // and if not throw an error
      errMsg = new Error('[WONDER answerRequest] no conversation found');
      errorHandler(errMsg, errorCallback);
    }
  }

}
