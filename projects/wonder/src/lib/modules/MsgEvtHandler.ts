import { attachMediaStream } from 'webrtc-adapter';

import { Wonder } from '../wonder';
import { Conversation } from './Conversation';
import { Demand } from './Demand';
import { guid, errorHandler } from './helpfunctions';
import { DataChannelEvtHandler } from './DataChannelEvtHandler';
import { Participant } from './Participant';
import { Message } from './Message';
import { MessageFactory } from './MessageFactory';
import { MessageType } from './Types';
import { Identity } from './Identity';

export class MsgEvtHandler {
  /**
   * @desc Flag to be able to tell if ice handling is allowed and the session description exchange of the peer connections is over
   */
  ice = false;

  constructor(
    /**
     * @desc Backreference to the wonder instance the message event handler is related to
     */
    public wonderInstance: Wonder,

    /**
     * @desc An reference to the conversation the event handler is handling incoming messages for
     */
    public conversation?: Conversation
  ) { }

  /**
   * @desc This is a function to handle all incoming messages from the messaging server.
   * @example
   * msgStubInstance.onMessage = conversation.msgEvtHandler.onMessage().bind(conversation.msgEvtHandler);
   */
  onMessage(msg: Message) {
    switch (msg.type) {

      case MessageType.invitation:
        if (this.conversation) { // if a conversation is attached to this message event handler
          console.log('[MsgEvtHandler onMessage] conversation is already present');
          if (this.conversation.id === msg.conversationId) { // and the conversatinId is matching then add new constaints/fulfill the demand
            console.log('[MsgEvtHandler onMessage] invitation is legit, updating conversation');
            this.wonderInstance.localIdp.getIdentity(msg.from.rtcIdentity)
              .then((identity: Identity) => {
                const remoteParticipant = this.conversation.getRemoteParticipant(identity);

                // choose the right method
                // did the remote user request audio or video
                if (msg.misc.demand.in.video || msg.misc.demand.out.video || msg.misc.demand.in.audio || msg.misc.demand.out.audio) {
                  // do i have such a connection already
                  if (
                    !remoteParticipant.demand.in.video &&
                    !remoteParticipant.demand.out.video &&
                    !remoteParticipant.demand.in.audio &&
                    !remoteParticipant.demand.out.audio
                  ) {
                    // only establish the connection when video or audio hasnt been created
                    this.establishRtcConnection(this.conversation, msg);
                  }
                }
                // create as many datachannels as the remote user wants
                if (msg.misc.demand.in.data || msg.misc.demand.out.data) {
                  this.establishDataChannel(this.wonderInstance, this.conversation, msg);
                }
              })
              .catch((error) => {
                errorHandler(error);
              });
          } else {
            errorHandler(
              `Message arrived at wrong MessageEventHandler or MessageEventHandler
              is still registered on myParticipant instead of a remoteParticipant!`
            );
          }
        } else {
          console.log('[MsgEvtHandler onMessage] invitation is legit, creating a new conversation');
          const conversation = new Conversation(this.wonderInstance);
          const myParticipant = new Participant(this.wonderInstance, this.wonderInstance.myIdentity, new Demand(msg.misc.demand).converted);
          conversation.id = msg.conversationId; // when we receive an invitation an id is already present, so use it
          conversation.myParticipant = myParticipant; // my local bob participant
          conversation.msgSrv = this.wonderInstance.myIdentity.msgSrv; // use my messaging server as I have been called
          conversation.msgStub = this.wonderInstance.myIdentity.msgStub; // copy my messaging stub to the conversation
          conversation.msgEvtHandler = this; // we also need to set this invitationhandler to the messaging handler of the conversation
          conversation.msgStub.onMessage = conversation.msgEvtHandler.onMessage.bind(conversation.msgEvtHandler);

          this.conversation = conversation; // reference it in the handler to use it in other functions
          this.wonderInstance.conversations.push(conversation); // add the conversation to wonder

          // get the remote identity
          this.wonderInstance.localIdp
            .getIdentity(msg.from.rtcIdentity)
            .then((identity: Identity) => {
              // Add participant and set the RTCPeerConnection
              conversation.addRemoteParticipant(new Participant(this.wonderInstance, identity, msg.misc.demand));
              conversation.myParticipant.setRtcPeerConnection(
                new RTCPeerConnection({
                  iceServers: this.wonderInstance.config.ice
                })
              );

              if (this.wonderInstance.config.autoAccept) {
                // choose the right method
                // TODO: change this to be able to establish a audio/video and a data connection with one invitation
                if (msg.misc.demand.in.data || msg.misc.demand.out.data) {
                  this.establishDataChannel(this.wonderInstance, conversation, msg);
                } else {
                  this.establishRtcConnection(conversation, msg);
                }
              }
            })
            .then(() => {
              this.wonderInstance.onMessage(msg); // user interface for message events
              return;
            })
            .catch((error) => {
              return error;
            });
        }
        return; // needs to be here in order not to call onMessage twice

      case MessageType.accepted:
        console.log('[MsgEvtHandler onMessage] accepted', msg);
        this.conversation.myParticipant.peerConnection.setRemoteDescription(
          new RTCSessionDescription(msg.misc.sessionDescription)
        );

        // tell bob this he can also start handling ice candidates now
        const message = MessageFactory.updateIceCandidates(
          this.conversation.myParticipant.identity,
          this.conversation.remoteParticipants[0].identity,
          this.conversation.id,
          'last'
        );
        this.conversation.msgStub.sendMessage(message);
        this.ice = true; // handle ice allowed for rtchandler

        // and send all kept back ice candidates
        for (let i = this.conversation.rtcEvtHandler.msgbuf.length - 1; i >= 0; i--) {
          this.conversation.msgStub.sendMessage(this.conversation.rtcEvtHandler.msgbuf[i]);
          this.conversation.rtcEvtHandler.msgbuf.splice(i, 1);
        }

        this.wonderInstance.onMessage(msg);
        break;

      case MessageType.declined:
        console.log('[MsgEvtHandler onMessage] declined', msg);
        this.wonderInstance.onMessage(msg);
        break;

      case MessageType.bye:
        console.log('[MsgEvtHandler onMessage] bye', msg);
        this.wonderInstance.onMessage(msg);
        break;

      case MessageType.update:
        console.log('[MsgEvtHandler onMessage] update', msg);
        this.wonderInstance.onMessage(msg);
        break;

      case MessageType.updateSdp:
        console.log('[MsgEvtHandler onMessage] updateSdp', msg);
        this.wonderInstance.onMessage(msg);
        break;

      case MessageType.updated:
        console.log('[MsgEvtHandler onMessage] updated', msg);
        this.wonderInstance.onMessage(msg);
        break;

      case MessageType.connectivityCandidate:
        console.log('[MsgEvtHandler onMessage] connectivityCandidate', msg);
        // we need to store the candidates because they can only be used when remotedesriptions are set
        // if we handle them before we wont see a video but a frozen transparent black blob inside the video element
        if (msg.misc === 'last') { // send all candidates to alice
          for (let i = this.conversation.rtcEvtHandler.msgbuf.length - 1; i >= 0; i--) {
            this.conversation.msgStub.sendMessage(this.conversation.rtcEvtHandler.msgbuf[i]);
            this.conversation.rtcEvtHandler.msgbuf.splice(i, 1);
          }
        } else { // if the last operation hasnt completed start adding candidates
          this.conversation.myParticipant.peerConnection.addIceCandidate(new RTCIceCandidate(msg.misc));
        }
        this.wonderInstance.onMessage(msg);
        break;

      case MessageType.message:
        console.log('[MsgEvtHandler onMessage] message', message);
        this.wonderInstance.onMessage(msg);
        break;

      default:
        console.log('[MsgEvtHandler onMessage] default', message);
        this.wonderInstance.onMessage(msg);
        break;
    }
  }

  /**
   * @desc This functions establishes a data channel for the invitation receiving side.
   * It is only called from the message event handler itself and shouldn't be used outside of it.
   */
  establishDataChannel(wonderInstance: Wonder, conversation: Conversation, msg: Message) {
    console.log('[MsgEvtHandler establishDataChannel] conversation:', conversation);
    if (conversation.dataChannelEvtHandler && conversation.dataChannelEvtHandler instanceof DataChannelEvtHandler) {
      console.log('[MsgEvtHandler establishDataChannel] Datachannel already present for a 2 party conversation');
      return;
    }
    import('./DataChannelBroker')
      .then((dataChannelBroker: any) => {
        console.log('[MsgEvtHandler establishDataChannel] loaded DataChannelBroker:', dataChannelBroker);
        // assign the dataChannelBroker to the conversation for later reference
        conversation.dataChannelBroker = new dataChannelBroker();

        const dataChannelEvtHandler = new DataChannelEvtHandler(wonderInstance, conversation); // create a new handler for the data channel

        dataChannelBroker.addDataChannelCodec(
          conversation.myParticipant.identity, // from me
          conversation.remoteParticipants[0].identity, // to the remote participant
          msg.misc.demand.in.data, // with the codec of the remote participant || or plain
          dataChannelEvtHandler // and the handler of the channel
        );

        return {
          dataChannelBroker,
          dataChannelEvtHandler
        };
      })
      .then((res) => {
        // get the codec
        const codec = res.dataChannelBroker.getDataChannelCodec(
          conversation.myParticipant.identity,
          conversation.remoteParticipants[0].identity,
          msg.misc.demand.in.data
        );

        // overwrite the codec with the help of its constructor
        // create the datachannel and assign it to the codec
        codec.dataChannel = conversation.myParticipant.peerConnection.createDataChannel(guid());
        // register the handler which will receive the message after the codec is finished decoding the message
        codec.onMessage = res.dataChannelEvtHandler.onEvt.bind(res.dataChannelEvtHandler);
        // tell the codec from whom messages are coming to be sent over the channel
        codec.from = conversation.myParticipant.identity;
        // tell the codec who the receiver is, can be helpful i.e. for chat communication
        codec.to = conversation.remoteParticipants[0].identity;

        // also register the dataChannel in its handler for easier reference
        res.dataChannelEvtHandler.dataChannel = codec.dataChannel;

        // override the functions which may be defined in the required codec to standard ones for correct functionality
        // when the data channel is ready then assign the codec's onDataMessage function to the channel
        codec.dataChannel.onopen = (evt) => {
          if (codec.dataChannel.readyState === 'open') {
            codec.dataChannel.onmessage = codec.onDataMessage.bind(codec);
          }
        };

        // register the data channel handler and bind its class as 'this' inside the function
        codec.dataChannel.onclose = res.dataChannelEvtHandler.onEvt.bind(res.dataChannelEvtHandler);
        console.log('codec:', codec);
        // attach the data channel to the conversation for testing
        // conversation.dc = codec.dataChannel; // TODO: THIS NEEDS TO BE HANDELED LATER ON!!!!

        // TODO: THIS NEEDS TO BE DONE EVERY TIME A PEERCONNECTION IS CREATED
        // ondatachannel is a rtcEvent and therefore needs to be handled there
        conversation.myParticipant.peerConnection.ondatachannel = conversation.rtcEvtHandler.onEvt.bind(conversation.rtcEvtHandler);

        // if a new data channel will be created it is a peer connection event or rtc event respectively
        conversation.myParticipant.peerConnection.ondatachannel = conversation.rtcEvtHandler.onEvt.bind(conversation.rtcEvtHandler);

        // reject ice handling as long as the sdp isnt set on both ends
        this.ice = false;

        // set the description of alice
        return conversation.myParticipant.peerConnection.setRemoteDescription(new RTCSessionDescription(msg.misc.sessionDescription));
      })
      .then(() => {
        console.log('[MsgEvtHandler establishDataChannel] set remote description success');
        return navigator.mediaDevices.getUserMedia(msg.misc.demand.in);
      })
      .then((stream) => {
        console.log(conversation.remoteParticipants);
        console.log(conversation.myParticipant);
      })
      .then(() => {
        return conversation.myParticipant.peerConnection.createAnswer();
      })
      .then((answer) => {
        return conversation.myParticipant.peerConnection.setLocalDescription(answer);
      })
      .then(() => {
        const m = MessageFactory.accepted(
          conversation.myParticipant.identity,
          conversation.remoteParticipants[0].identity,
          conversation.id,
          conversation.remoteParticipants[0].demand,
          conversation.myParticipant.peerConnection.localDescription
        );
        conversation.msgStub.sendMessage(m);
      })
      .catch(errorHandler);
  }

  /**
   * @desc This functions establishes a video or audio connection to the remote peer
   */
  establishRtcConnection(conversation: Conversation, msg: Message) {
    // conversation.remoteParticipants[0].demand.out needs to be updated too

    conversation.myParticipant.peerConnection.setRemoteDescription(new RTCSessionDescription(msg.misc.sessionDescription))
      .then(() => {
        console.log('[MsgEvtHandler establishRtcConnection] set remote descriptiopn success');
        return navigator.mediaDevices.getUserMedia(msg.misc.demand.in);
      })
      .then((stream: MediaStream) => {
        attachMediaStream(document.getElementById('localVideo'), stream);
        stream.getTracks().forEach((track) => {
          conversation.myParticipant.peerConnection.addTrack(track, stream);
        });
      })
      .then(() => {
        return conversation.myParticipant.peerConnection.createAnswer();
      })
      .then((answer) => {
        console.log('conversation.remoteParticipants[0].demand', conversation.remoteParticipants[0].demand);
        return conversation.myParticipant.peerConnection.setLocalDescription(answer);
      })
      .then(() => {
        const m = MessageFactory.accepted(
          conversation.myParticipant.identity,
          conversation.remoteParticipants[0].identity,
          conversation.id,
          conversation.remoteParticipants[0].demand,
          conversation.myParticipant.peerConnection.localDescription
        );
        conversation.msgStub.sendMessage(m);
      })
      .catch(errorHandler);
  }

  /**
   * @desc This function is needed to interrupt the processing of an invitation
   * and establishes the desired data channel, audio or video connection
   * after the user has granted his permission to do so.
   */
  answerRequest(msg: Message, permission: boolean) {
    console.log('[MsgEvtHandler answerRequest] permission granted: ', permission);
    // choose the right method
    // TODO: change this to be able to establish a audio/video and a data connection with one invitation
    if (permission) {
      if (msg.misc.demand.in.data || msg.misc.demand.out.data) {
        this.establishDataChannel(this.wonderInstance, this.conversation, msg);
      } else {
        this.establishRtcConnection(this.conversation, msg);
      }
    } else {
      console.log(this.conversation);
      const m = MessageFactory.declined(
        this.conversation.myParticipant.identity,
        this.conversation.remoteParticipants[0].identity, // use from from value as target for declined message
        this.conversation.id
      );
      this.conversation.msgStub.sendMessage(m);
    }
  }

}
