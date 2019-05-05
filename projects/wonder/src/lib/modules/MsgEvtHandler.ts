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
  ice = false;

  constructor(
    public wonderInstance: Wonder,
    public conversation?: Conversation
  ) { }

  onMessage(msg: Message) {
    const that = this;
    switch (msg.type) {

      case MessageType.invitation:
        if (that.conversation) { // if a conversation is attached to that message event handler
          console.log('[MsgEvtHandler onMessage] conversation is already present');
          if (that.conversation.id === msg.conversationId) { // and the conversatinId is matching then add new constaints/fulfill the demand
            console.log('[MsgEvtHandler onMessage] invitation is legit, updating conversation');
            that.wonderInstance.localIdp.getIdentity(msg.from.rtcIdentity)
            .then((identity: Identity) => {
              const remoteParticipant = that.conversation.getRemoteParticipant(identity);

              console.log('remote demand: ', msg.misc.demand);
              // choose the right method
              // did the remote user request audio or video
              if (msg.misc.demand.in.video || msg.misc.demand.out.video ||
                  msg.misc.demand.in.audio || msg.misc.demand.out.audio) {
                // do i have such a connection already
                console.log('remoteParticipant', remoteParticipant);
                // if (!remoteParticipant.demand.in.video && !remoteParticipant.demand.out.video &&
                //    !remoteParticipant.demand.in.audio && !remoteParticipant.demand.out.audio)

                // only establish the connection when video or audio hasnt been created
                that.establishRtcConnection(that.wonderInstance, that.conversation, msg);
              }
              // create as many datachannels as the remote user wants
              if (msg.misc.demand.in.data || msg.misc.demand.out.data) {
                that.establishDataChannel(that.wonderInstance, that.conversation, msg);
              }
            })
            .catch((error) => {
              console.error(error);
            });
          } else {
            console.error(
              `Message arrived at wrong MessageEventHandler or MessageEventHandler
              is still registered on myParticipant instead of a remoteParticipant!`
            );
          }
        } else {
          console.log('[MsgEvtHandler onMessage] invitation is legit, creating a new conversation');
          const conversation = new Conversation(that.wonderInstance);
          const myParticipant = new Participant(that.wonderInstance, that.wonderInstance.myIdentity, new Demand(msg.misc.demand).converted);
          conversation.id = msg.conversationId; // when we receive an invitation an id is already present, so use it
          conversation.myParticipant = myParticipant; // my local bob participant
          conversation.msgSrv = that.wonderInstance.myIdentity.msgSrv; // use my messaging server as I have been called
          conversation.msgStub = that.wonderInstance.myIdentity.msgStub; // copy my messaging stub to the conversation
          conversation.msgEvtHandler = that; // we also need to set this invitationhandler to the messaging handler of the conversation
          conversation.msgStub.onMessage = conversation.msgEvtHandler.onMessage.bind(conversation.msgEvtHandler);

          that.conversation = conversation; // reference it in the handler to use it in other functions
          that.wonderInstance.conversations.push(conversation); // add the conversation to wonder

          // get the remote identity
          that.wonderInstance.localIdp.getIdentity(msg.from.rtcIdentity)
          .then((identity: Identity) => {
            // Add participant and set the RTCPeerConnection
            conversation.addRemoteParticipant(new Participant(that.wonderInstance, identity, msg.misc.demand));
            conversation.myParticipant.setRtcPeerConnection(
              new RTCPeerConnection({
                iceServers: that.wonderInstance.config.ice
              })
            );

            if (that.wonderInstance.config.autoAccept) {
              // choose the right method
              // TODO: change this to be able to establish a audio/video and a data connection with one invitation
              if (msg.misc.demand.in.data || msg.misc.demand.out.data) {
                that.establishDataChannel(that.wonderInstance, conversation, msg);
              } else {
                that.establishRtcConnection(that.wonderInstance, conversation, msg);
              }
            }
          })
          .then(() => {
            that.wonderInstance.onMessage(msg); // user interface for message events
            return;
          })
          .catch((error) => {
            return error;
          });
        }
        return; // needs to be here in order not to call onMessage twice

      case MessageType.accepted:
        console.log('[MsgEvtHandler onMessage] accepted', msg);
        that.conversation.myParticipant.peerConnection.setRemoteDescription(
          new RTCSessionDescription(msg.misc.sessionDescription)
        );

        // tell bob that he can also start handling ice candidates now
        const message = MessageFactory.updateIceCandidates(
          that.conversation.myParticipant.identity,
          that.conversation.remoteParticipants[0].identity,
          that.conversation.id,
          'last'
        );
        that.conversation.msgStub.sendMessage(message);
        that.ice = true; // handle ice allowed for rtchandler

        // and send all kept back ice candidates
        for (let i = that.conversation.rtcEvtHandler.msgbuf.length - 1; i >= 0; i--) {
          that.conversation.msgStub.sendMessage(that.conversation.rtcEvtHandler.msgbuf[i]);
          that.conversation.rtcEvtHandler.msgbuf.splice(i, 1);
        }

        that.wonderInstance.onMessage(msg);
        break;

      case MessageType.declined:
        console.log('[MsgEvtHandler onMessage] declined', msg);
        that.wonderInstance.onMessage(msg);
        break;

      case MessageType.bye:
        console.log('[MsgEvtHandler onMessage] bye', msg);
        that.wonderInstance.onMessage(msg);
        break;

      case MessageType.update:
        console.log('[MsgEvtHandler onMessage] update', msg);
        that.wonderInstance.onMessage(msg);
        break;

      case MessageType.updateSdp:
        console.log('[MsgEvtHandler onMessage] updateSdp', msg);
        that.wonderInstance.onMessage(msg);
        break;

      case MessageType.updated:
        console.log('[MsgEvtHandler onMessage] updated', msg);
        that.wonderInstance.onMessage(msg);
        break;

      case MessageType.connectivityCandidate:
        console.log('[MsgEvtHandler onMessage] connectivityCandidate', msg);
        // we need to store the candidates because they can only be used when remotedesriptions are set
        // if we handle them before we wont see a video but a frozen transparent black blob inside the video element
        if (msg.misc === 'last') { // send all candidates to alice
          for (let i = that.conversation.rtcEvtHandler.msgbuf.length - 1; i >= 0; i--) {
            that.conversation.msgStub.sendMessage(that.conversation.rtcEvtHandler.msgbuf[i]);
            that.conversation.rtcEvtHandler.msgbuf.splice(i, 1);
          }
        } else { // if the last operation hasnt completed start adding candidates
          that.conversation.myParticipant.peerConnection.addIceCandidate(new RTCIceCandidate(msg.misc));
        }
        that.wonderInstance.onMessage(msg);
        break;

      case MessageType.message:
        console.log('[MsgEvtHandler onMessage] message', message);
        that.wonderInstance.onMessage(msg);
        break;

      default:
        console.log('[MsgEvtHandler onMessage] default', message);
        that.wonderInstance.onMessage(msg);
        break;
    }
  }

  establishDataChannel(wonderInstance: Wonder, conversation: Conversation, msg: Message) {
    const that = this;
    console.log('conversation:', conversation);
    if (conversation.dataChannelEvtHandler && conversation.dataChannelEvtHandler instanceof DataChannelEvtHandler) {
      console.log('Datachannel already present for a 2 party conversation');
      return;
    }
    import('./DataChannelBroker')
      .then((dataChannelBroker: any) => {
        console.log(dataChannelBroker);
        // assign the dataChannelBroker to the conversation for later reference
        conversation.dataChannelBroker = dataChannelBroker.constructor();

        const dataChannelEvtHandler = new DataChannelEvtHandler(wonderInstance, conversation); // create a new handler for the data channel

        dataChannelBroker.addDataChannelCodec(
          conversation.myParticipant.identity, // from me
          conversation.remoteParticipants[0].identity, // to the remote participant
          msg.misc.demand.in.data, // with the codec of the remote participant || or plain
          dataChannelEvtHandler // and the handler of the channel
        )
        .then((codec) => {
          // get the codec
          codec = dataChannelBroker.getDataChannelCodec(
            conversation.myParticipant.identity,
            conversation.remoteParticipants[0].identity,
            msg.misc.demand.in.data
          );

          // overwrite the codec with the help of its constructor
          // create the datachannel and assign it to the codec
          codec.dataChannel = conversation.myParticipant.peerConnection.createDataChannel(guid());
          // register the handler which will receive the message after the codec is finished decoding the message
          codec.onMessage = dataChannelEvtHandler.onEvt.bind(dataChannelEvtHandler);
          // tell the codec from whom messages are coming to be sent over the channel
          codec.from = conversation.myParticipant.identity;
          // tell the codec who the receiver is, can be helpful i.e. for chat communication
          codec.to = conversation.remoteParticipants[0].identity;

          // also register the dataChannel in its handler for easier reference
          dataChannelEvtHandler.dataChannel = codec.dataChannel;

          // override the functions which may be defined in the required codec to standard ones for correct functionality
          // when the data channel is ready then assign the codec's onDataMessage function to the channel
          codec.dataChannel.onopen = (evt) => {
            if (codec.dataChannel.readyState === 'open') {
              codec.dataChannel.onmessage = codec.onDataMessage.bind(codec);
            }
          };

          // register the data channel handler and bind its class as 'this' inside the function
          codec.dataChannel.onclose = dataChannelEvtHandler.onEvt.bind(dataChannelEvtHandler);
          console.log('codec:', codec);
          // attach the data channel to the conversation for testing
          // conversation.dc = codec.dataChannel; // TODO: THIS NEEDS TO BE HANDELED LATER ON!!!!

          // TODO: THIS NEEDS TO BE DONE EVERY TIME A PEERCONNECTION IS CREATED
          // ondatachannel is a rtcEvent and therefore needs to be handled there
          conversation.myParticipant.peerConnection.ondatachannel = conversation.rtcEvtHandler.onEvt.bind(conversation.rtcEvtHandler);

          // if a new data channel will be created it is a peer connection event or rtc event respectively
          conversation.myParticipant.peerConnection.ondatachannel = conversation.rtcEvtHandler.onEvt.bind(conversation.rtcEvtHandler);

          // reject ice handling as long as the sdp isnt set on both ends
          that.ice = false;

          // set the description of alice
          conversation.myParticipant.peerConnection.setRemoteDescription(new RTCSessionDescription(msg.misc.sessionDescription))
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
        })
        .catch(errorHandler);
      }, errorHandler);
  }

  establishRtcConnection(wonderInstance: Wonder, conversation: Conversation, msg: Message) {
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

  answerRequest(msg: Message, permission: boolean) {
    const that = this;
    console.log('[MsgEvtHandler answerRequest] permission granted: ', permission);
    // choose the right method
    // TODO: change this to be able to establish a audio/video and a data connection with one invitation
    if (permission === true) {
      if (msg.misc.demand.in.data || msg.misc.demand.out.data) {
        that.establishDataChannel(that.wonderInstance, that.conversation, msg);
      } else {
        that.establishRtcConnection(that.wonderInstance, that.conversation, msg);
      }
    } else {
      console.log(that.conversation);
      const m = MessageFactory.declined(
        that.conversation.myParticipant.identity,
        that.conversation.remoteParticipants[0].identity, // use from from value as target for declined message
        that.conversation.id
      );
      that.conversation.msgStub.sendMessage(m);
    }
  }

}
