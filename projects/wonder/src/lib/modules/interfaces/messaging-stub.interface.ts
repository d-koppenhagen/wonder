import { Message } from '../Message';

export interface IMessagingStub {
  sendMessage(message: Message): void;
  connect(
    ownRtcIdentity: string,
    credentials?: any,
    msgSrv?: string,
    callbackFunction?: () => void
  ): void;
  disconnect(): void;
  onMessage(msg: Message): void;
}
