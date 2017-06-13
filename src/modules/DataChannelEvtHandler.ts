import { Wonder } from '../wonder';
import { Conversation } from './Conversation';
import { DataChannelEvtType } from './Types';

export class DataChannelEvtHandler {
  dataChannel: RTCDataChannel;

  constructor(
    public wonderInstance: Wonder,
    public conversation: Conversation
  ) { }

  onEvt(evt: { type }) { // getting the conversation from the constructor doesnt work as on
    const that = this;
    console.log('[DataChannelEvtHandler] event:', evt);

    switch (evt.type) {
      case DataChannelEvtType.onopen:
        // console.log('this should be never ever called');
        console.log('[DataChannelEvtHandler onEvt] onopen', evt);
        // if the data channel is established the onmessage listener can be called
        // if (that.dataChannel.readyState === 'open') that.dataChannel.onmessage = that.onEvt;
        if (this.dataChannel.readyState === 'open') {
          this.dataChannel.onmessage = that.onEvt
        };
        // if (that.conversation.dc.readyState === 'open') that.conversation.dc.onmessage = that.onEvt;
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
