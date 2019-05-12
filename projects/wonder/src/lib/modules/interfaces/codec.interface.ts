import { Identity } from '../Identity';

export interface ICodec {
  dataChannel?: RTCDataChannel;
  from?: Identity;
  to?: Identity;
  send(input: any, dataChannel: RTCDataChannel): void;
  onDataMessage(dataMsg: any): void;
}
