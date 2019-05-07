import { Message } from './Message';
import { Identity } from './Identity';
import { MessageType } from './Types';

describe('Message', () => {
  const identityA = new Identity(
    'alice@mydomain.com',
    'webfinger',
    null,
    'https://domain.com/stubs/mystub.js',
    'http://mymsgsrv.com'
  );

  const identityB = new Identity(
    'bob@mydomain.com',
    'webfinger',
    null,
    'https://domain.com/stubs/mystub.js',
    'http://mymsgsrv.com'
  );

  const identityC = new Identity(
    'carol@mydomain.com',
    'webfinger',
    null,
    'https://domain.com/stubs/mystub.js',
    'http://mymsgsrv.com'
  );

  it('should return a accepted message', () => {
    const msg = new Message(
      identityA,
      identityB,
      MessageType.accepted,
      'abcdefghij'
    );

    expect(msg).toBeDefined();
    expect(msg.id).toBeDefined();
    expect(msg.id.length).toEqual(36);
  });

  it('should return a invitation message mith multiple target identities', () => {
    const msg = new Message(
      identityA,
      [identityB, identityC],
      MessageType.invitation,
      '1234567890'
    );

    expect(msg).toBeDefined();
    expect(msg.id).toBeDefined();
    expect(msg.id.length).toEqual(36);
  });
});
