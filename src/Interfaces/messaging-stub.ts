import { Message } from '../modules/message';

export interface IMessagingStub {

  sendMessage(message: Message);

  connect(
    ownRtcIdentity: string,
    credentials: {} | null,
    msgSrv: string,
    callbackFunction: Function
  );

  disconnect();

}
