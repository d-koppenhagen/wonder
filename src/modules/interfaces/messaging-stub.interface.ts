import { Message } from '../Message';

export interface IMessagingStub {

  constructor(): void;

  sendMessage(message: Message | Error);

  onMessage();

  connect(
    ownRtcIdentity: string,
    credentials: {} | null,
    msgSrv: string,
    callbackFunction: Function
  );

  disconnect();

}
