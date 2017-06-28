export interface IJsonIdp {
  offset: number;
  rows: [{
    messagingStubURL: string;
    localMsgStubURL?: string;
    messagingServer: string;
    codec_plain: string;
  }];
  total_rows: number;
  millis: number;
}
