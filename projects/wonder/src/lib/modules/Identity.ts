import { IMessagingStub } from './interfaces';
import { PayloadType } from './Types';
export class Identity {
  constructor(
    public rtcIdentity: string,
    public remoteIdp: string,
    public msgStub: IMessagingStub,
    public msgStubUrl: string,
    public msgSrv: string,
    public codecs?: { [key in PayloadType]?: string },
    public credentials?: any
  ) { }
}
