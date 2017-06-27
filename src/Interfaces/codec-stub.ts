export interface ICodecStub {

  send(input: {}, dataChannel: RTCDataChannel);

  onDataMessage(dataMsg: string);
}
