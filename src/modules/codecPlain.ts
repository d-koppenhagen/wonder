import { ICodec } from './interfaces';

class Codec implements ICodec {
  constructor(
    public dataChannel: RTCDataChannel,
    public onMessage: Function
  ) { }

  send(input: {}, dataChannel: RTCDataChannel) {
    console.log('[Codec Plain] send:', input, dataChannel);
    if (dataChannel) { // when used as a general codec for many data channels
      dataChannel.send(JSON.stringify(input));
    } else { // when instanciated only for a particular channel
      this.dataChannel.send(JSON.stringify(input));
    }
  }

  onDataMessage(dataMsg: string) {
    console.log('[Codec Plain] onData:', dataMsg);
    this.onMessage(dataMsg);
  }

}

