declare var RTCDataChannel;
export interface ICodec {
  constructor(dataChannel: RTCDataChannel, onMessage: () => void): void;
  send(input: any, dataChannel: RTCDataChannel): void;
  onDataMessage(dataMsg: any): void;
}
