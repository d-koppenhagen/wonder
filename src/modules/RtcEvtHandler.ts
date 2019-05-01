import { Wonder } from '../wonder';
import { Conversation } from './Conversation';
import { errorHandler } from './helpfunctions';
import { RtcEvtType } from './Types';
import { MessageFactory } from './MessageFactory';

export class RtcEvtHandler {
  msgbuf: any[] = [];

  constructor(
    public wonderInstance: Wonder,
    public conversation: Conversation
  ) { }

  onEvt(evt: { type; candidate: any }) {
    const that = this;

    switch (evt.type) {
      case RtcEvtType.onaddstream:
        console.log('[RtcEvtHandler onEvt] onaddstream!', evt);
        break;

      case RtcEvtType.onaddlocalstream:
        console.log('[RtcEvtHandler onEvt] onaddlocalstream', evt);
        break;

      case RtcEvtType.onnegotiationneeded:
        console.log('[RtcEvtHandler onEvt] onnegotiationneeded', evt);
        that.conversation.myParticipant.peerConnection.createOffer(
          offer => {
            that.conversation.myParticipant.peerConnection.setLocalDescription(
              offer,
              () => {
                const m = MessageFactory.updateSdp(
                  that.conversation.myParticipant.identity,
                  that.conversation.remoteParticipants[0].identity,
                  that.conversation.id,
                  offer
                );
                that.conversation.msgStub.sendMessage(m);
              },
              errorHandler
            );
          },
          errorHandler
        );
        break;

      case RtcEvtType.onicecandidate:
        console.log('[RtcEvtHandler onEvt] icecandidate: ', evt);
        // candidate exists in e.candidate
        // its triggered when the local machine wants ice

        // when there is no ice candidate present we cannot establish a connection (STUN/TURN needed); or it is the last candidate
        if (!evt.candidate) { return; }
        console.log('[RtcEvtHandler onEvt] conversation: ', this.conversation);
        console.log(evt);

        const newcandidate = new RTCIceCandidate({ // @TODO remove this and test it
          sdpMLineIndex: 0,
          candidate: evt.candidate.candidate,
          sdpMid: evt.candidate.sdpMid
        });

        const msg = MessageFactory.updateIceCandidates(
          that.conversation.myParticipant.identity,
          that.conversation.remoteParticipants[0].identity,
          that.conversation.id,
          evt.candidate
        ); // create a message with the icecandidates in it

        if (that.conversation.msgEvtHandler.ice) { // send directly when allowed
          that.conversation.msgStub.sendMessage(msg);
          // and all others
          for (let i = that.msgbuf.length - 1; i >= 0; i--) {
            that.conversation.msgStub.sendMessage(that.msgbuf[i]);
            that.msgbuf.splice(i, 1);
          }
        } else {
          that.msgbuf.push(msg);
        }
        break;

      case RtcEvtType.onsignalingstatechange:
        console.log('[RtcEvtHandler onEvt] onsignalingstatechange', evt);
        break;

      case RtcEvtType.onremovestream:
        console.log('[RtcEvtHandler onEvt] onremovestream', evt);

        break;

      case RtcEvtType.oniceconnectionstatechange:
        console.log('[RtcEvtHandler onEvt] iceConnectionStatechange NOW: ', evt);
        break;

      case RtcEvtType.ondatachannel:
        console.log('[RtcEvtHandler onEvt] ondatachannel', evt);
        if (that.conversation.dataChannelEvtHandler) {
          evt.channel.onmessage = that.conversation.dataChannelEvtHandler.onEvt.bind(that.conversation.dataChannelEvtHandler);
        } else {
          // @TODO remove static link to the participant, get it more dynamically to support multiparty conversations
          console.log('that.conversation.remoteParticipants[0].demand', that.conversation.remoteParticipants[0].demand);
          console.log(that.conversation.remoteParticipants[0].demand['out'].data);
          const codec = that.conversation.dataChannelBroker.getDataChannelCodec(
            that.conversation.myParticipant.identity,
            that.conversation.remoteParticipants[0].identity,
            that.conversation.remoteParticipants[0].demand.out.data
          );
          evt.channel.onmessage = codec.onDataMessage.bind(codec);
          evt.channel.payloadType = that.conversation.remoteParticipants[0].demand['out'].data;
        }
        break;

      default:
        console.log('[RtcEvtHandler onEvt] default', evt);
        break;
    }

    this.wonderInstance.onRtcEvt(evt);
  }

}
