import { Wonder } from '../wonder';
import { Conversation } from './Conversation';
import { DataChannelEvtType } from './Types';

/**
 * @desc This class is an event handler for events coming from a RTCDataChannel.
 */
export class DataChannelEvtHandler {
  /**
   * @desc A reference to the data channel for which the data channel event handler handles events
   */
  dataChannel: RTCDataChannel;

  constructor(
    /**
     * @desc A reference to the wonder instance on which the data channel event handler is used
     */
    public wonderInstance: Wonder,

    /**
     * @desc A reference to the conversation the data channel event handler is present on
     */
    public conversation: Conversation
  ) { }

  /**
   * @desc This function processes the events of a data channel.
   * Is is ment to be called after the events were processed by the datachannel's codec
   * but could also be used directly on the datachannel without a codec.
   * @example // usage without the codec inbetween
   * var dataChannel = peerConnection.createDataChannel(guid());
   * dataChannel.onmessage = dataChannelEvtHandler.onEvt.bind(dataChannelEvtHandler);
   * @example // usage with the codec inbetween
   * codec.dataChannel = peerConnection.createDataChannel(guid());
   * codec.dataChannel.onmessage = codec.onDataMessage.bind(codec);
   * codec.onMessage = dataChannelEvtHandler.onEvt.bind(dataChannelEvtHandler);
   */
  onEvt(evt: { type }) { // getting the conversation from the constructor doesnt work as on
    console.log('[DataChannelEvtHandler] event:', evt);

    switch (evt.type) {
      case DataChannelEvtType.onopen:
        // console.log('this should be never ever called');
        console.log('[DataChannelEvtHandler onEvt] onopen', evt);
        // if the data channel is established the onmessage listener can be called
        if (this.dataChannel.readyState === 'open') {
          this.dataChannel.onmessage = this.onEvt;
        }
        break;

      case DataChannelEvtType.onclose:
        console.log('[DataChannelEvtHandler onEvt] onclose', evt);
        break;

      case DataChannelEvtType.ondatachannel:
        console.log('[DataChannelEvtHandler onEvt] ondatachannel', evt);
        break;

      case DataChannelEvtType.onmessage:
        console.log('[DataChannelEvtHandler onEvt] onmessage', evt);
        break;

      default:
        console.log('[DataChannelEvtHandler onEvt] default', evt);
        break;
    }

    this.wonderInstance.onDataChannelEvt(evt);
  }

}
