declare var RTCDataChannel;
export interface ICodec {

  send(input: {}, dataChannel: RTCDataChannel);

  onDataMessage(dataMsg: string);
}
