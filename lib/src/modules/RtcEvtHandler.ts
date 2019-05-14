import { Wonder } from '../wonder';
import { Conversation } from './Conversation';
import { errorHandler } from './helpfunctions';
import { RtcEvtType } from './Types';
import { MessageFactory } from './MessageFactory';
import { Message } from './Message';

/**
 * @desc This class is an event handler vor events coming from a peer connection
 */
export class RtcEvtHandler {
  /**
   * @desc An array for buffering ICE candidate messages before they are sent
   */
  msgbuf: Message[] = [];

  constructor(
    /**
     * @desc Backreference to the wonder instance
     */
    public wonderInstance: Wonder,

    /**
     * @desc An reference to the corresponding conversation
     */
    public conversation: Conversation
  ) { }

  /**
   * @desc This event handler processes events coming from a peer connection.
   * @example
   * participant.peerConnection.ondatachannel = conversation.rtcEvtHandler.onEvt.bind(conversation.rtcEvtHandler);
   */
  onEvt(evt: { type: string; candidate: RTCIceCandidate; channel?: any }) {
    switch (evt.type) {
      case RtcEvtType.onaddstream:
        console.log('[RtcEvtHandler onEvt] onaddstream!', evt);
        break;

      case RtcEvtType.onaddlocalstream:
        console.log('[RtcEvtHandler onEvt] onaddlocalstream', evt);
        break;

      case RtcEvtType.onnegotiationneeded:
        console.log('[RtcEvtHandler onEvt] onnegotiationneeded', evt);
        this.conversation.myParticipant.peerConnection.createOffer()
          .then((offer) => {
            return this.conversation.myParticipant.peerConnection.setLocalDescription(offer);
          })
          .then(() => {
            const m = MessageFactory.updateSdp(
              this.conversation.myParticipant.identity,
              this.conversation.remoteParticipants[0].identity,
              this.conversation.id,
              this.conversation.myParticipant.peerConnection.localDescription
            );
            this.conversation.msgStub.sendMessage(m);
          }).catch((reason) => {
            errorHandler(reason);
          });
        break;

      case RtcEvtType.onicecandidate:
        console.log('[RtcEvtHandler onEvt] icecandidate: ', evt);
        // candidate exists in e.candidate
        // its triggered when the local machine wants ice

        // when there is no ice candidate present we cannot establish a connection (STUN/TURN needed); or it is the last candidate
        if (!evt.candidate) { return; }
        console.log('[RtcEvtHandler onEvt] conversation: ', this.conversation);

        const msg = MessageFactory.updateIceCandidates(
          this.conversation.myParticipant.identity,
          this.conversation.remoteParticipants[0].identity,
          this.conversation.id,
          evt.candidate
        ); // create a message with the icecandidates in it

        if (this.conversation.msgEvtHandler.ice) { // send directly when allowed
          this.conversation.msgStub.sendMessage(msg);
          // and all others
          for (let i = this.msgbuf.length - 1; i >= 0; i--) {
            this.conversation.msgStub.sendMessage(this.msgbuf[i]);
            this.msgbuf.splice(i, 1);
          }
        } else {
          this.msgbuf.push(msg);
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
        if (this.conversation.dataChannelEvtHandler) {
          evt.channel.onmessage = this.conversation.dataChannelEvtHandler.onEvt.bind(this.conversation.dataChannelEvtHandler);
        } else {
          // @TODO remove static link to the participant, get it more dynamically to support multiparty conversations
          console.log('this.conversation.remoteParticipants[0].demand', this.conversation.remoteParticipants[0].demand);
          const codec = this.conversation.dataChannelBroker.getDataChannelCodec(
            this.conversation.myParticipant.identity,
            this.conversation.remoteParticipants[0].identity,
            this.conversation.remoteParticipants[0].demand.out.data
          );
          evt.channel.onmessage = codec.onDataMessage.bind(codec);
          evt.channel.payloadType = this.conversation.remoteParticipants[0].demand.out.data;
        }
        break;

      default:
        console.log('[RtcEvtHandler onEvt] default', evt);
        break;
    }

    this.wonderInstance.onRtcEvt(evt);
  }

}
