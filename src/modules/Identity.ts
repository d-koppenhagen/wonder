import { IMessagingStub } from './interfaces';

export class Identity {
  constructor(
    public rtcIdentity: string,
    public remoteIdp: string,
    public msgStub: IMessagingStub,
    public msgStubUrl: string,
    public msgSrv: string,
    public codecs: {},
    public credentials: {}
  ) {}
}
