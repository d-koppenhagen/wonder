import { Message } from '../Message';

export interface IMessagingStub {

  sendMessage(message: typeof Message | Error);

  onMessage();

  connect(
    ownRtcIdentity: string,
    credentials: {} | null,
    msgSrv: string,
    callbackFunction: Function
  );

  disconnect();

}
