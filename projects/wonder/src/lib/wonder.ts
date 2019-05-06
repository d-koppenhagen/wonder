import { Conversation } from './modules/Conversation';
import { Demand } from './modules/Demand';
import { Identity } from './modules/Identity';
import { Idp } from './modules/Idp';
import { Message } from './modules/Message';
import { Participant } from './modules/Participant';
import { MsgEvtHandler } from './modules/MsgEvtHandler';
import { IBaseConfig } from './modules/interfaces';
import { IDemand } from './modules/interfaces/demand.interface';

export class Wonder {
  config: IBaseConfig;
  conversations: Conversation[] = [];
  myIdentity: Identity = null;
  localIdp: Idp = null;
  onMessage = new Function();
  onRtcEvt = new Function();
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
          import('./modules/callSingle')
            .then((CallSingle: any) => {
              CallSingle.call(that, recipients, conversation, demand)
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
            });

        }
        // start a data channel
        if (demand.out.data) {
          import('./modules/DataChannel')
            .then((DataChannel: any) => {
              // also hand over the data object to tell what payload type is wanted
              DataChannel.establish(that, recipients, conversation, demand.out.data)
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
