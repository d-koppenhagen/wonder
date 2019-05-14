import { Identity } from './Identity';

describe('Identity', () => {
  const stub = null;

  it('should return an identity', () => {
    const identity = new Identity(
      'alice@mydomain.com',
      'webfinger',
      stub,
      'https://domain.com/stubs/mystub.js',
      'http://mymsgsrv.com'
    );
    expect(identity).toBeDefined();
    expect(identity.rtcIdentity).toEqual('alice@mydomain.com');
    expect(identity.remoteIdp).toEqual('webfinger');
    expect(identity.msgStub).toEqual(stub);
    expect(identity.msgStubUrl).toEqual('https://domain.com/stubs/mystub.js');
    expect(identity.msgSrv).toEqual('http://mymsgsrv.com');
    expect(identity.codecs).toBeUndefined();
    expect(identity.credentials).toBeUndefined();
  });
});
