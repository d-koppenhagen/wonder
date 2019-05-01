import { Message } from '../Message';

export interface IMessagingStub {
  constructor(): IMessagingStub;
  sendMessage(message: Message | Error): void;
  connect(
    ownRtcIdentity: string,
    credentials?: any,
    msgSrv?: string,
    callbackFunction?: () => void
  ): void;
  disconnect(): void;
  onMessage(msg: Message): void;
}
