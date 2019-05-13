import { Message } from './Message';
import { Identity } from './Identity';
import { MessageFactory } from './MessageFactory';

describe('MessageFactory', () => {
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

  const demand = {
    in: {
      audio: false,
      video: false,
      data: false
    },
    out: {
      audio: false,
      video: false,
      data: false
    }
  };

  it('should return an invitation message', () => {
    const resultFromFactory = MessageFactory.invitation(identityA, [identityB, identityC], 'abc123', demand, {});
    expect(resultFromFactory instanceof Message).toBeTruthy();
    expect(resultFromFactory.from).toEqual(identityA);
    expect(resultFromFactory.to).toEqual([identityB, identityC]);
    expect(resultFromFactory.type).toEqual('invitation');
    expect(resultFromFactory.conversationId).toEqual('abc123');
    expect(resultFromFactory.misc).toEqual({
      demand,
      sessionDescription: {}
    });
    expect(resultFromFactory.id.length).toBe(36);
  });

  it('should return an accepted message', () => {
    const resultFromFactory = MessageFactory.accepted(identityA, [identityB, identityC], 'abc123', demand, {});
    expect(resultFromFactory instanceof Message).toBeTruthy();
    expect(resultFromFactory.from).toEqual(identityA);
    expect(resultFromFactory.to).toEqual([identityB, identityC]);
    expect(resultFromFactory.type).toEqual('accepted');
    expect(resultFromFactory.conversationId).toEqual('abc123');
    expect(resultFromFactory.misc).toEqual({
      demand,
      sessionDescription: {}
    });
    expect(resultFromFactory.id.length).toBe(36);
  });

  it('should return an declined message', () => {
    const resultFromFactory = MessageFactory.declined(identityA, [identityB, identityC], 'abc123');
    expect(resultFromFactory instanceof Message).toBeTruthy();
    expect(resultFromFactory.from).toEqual(identityA);
    expect(resultFromFactory.to).toEqual([identityB, identityC]);
    expect(resultFromFactory.type).toEqual('declined');
    expect(resultFromFactory.conversationId).toEqual('abc123');
    expect(resultFromFactory.id.length).toBe(36);
  });

  it('should return an bye message', () => {
    const resultFromFactory = MessageFactory.bye(identityA, [identityB, identityC], 'abc123');
    expect(resultFromFactory instanceof Message).toBeTruthy();
    expect(resultFromFactory.from).toEqual(identityA);
    expect(resultFromFactory.to).toEqual([identityB, identityC]);
    expect(resultFromFactory.type).toEqual('bye');
    expect(resultFromFactory.conversationId).toEqual('abc123');
    expect(resultFromFactory.id.length).toBe(36);
  });

  it('should return an updateDemand message', () => {
    const resultFromFactory = MessageFactory.updateDemand(identityA, [identityB, identityC], 'abc123', demand);
    expect(resultFromFactory instanceof Message).toBeTruthy();
    expect(resultFromFactory.from).toEqual(identityA);
    expect(resultFromFactory.to).toEqual([identityB, identityC]);
    expect(resultFromFactory.type).toEqual('update');
    expect(resultFromFactory.conversationId).toEqual('abc123');
    expect(resultFromFactory.misc).toEqual({
      demand
    });
    expect(resultFromFactory.id.length).toBe(36);
  });

  it('should return an updateIceCandidates message', () => {
    const resultFromFactory = MessageFactory.updateIceCandidates(identityA, [identityB, identityC], 'abc123', { a: 'something'});
    expect(resultFromFactory instanceof Message).toBeTruthy();
    expect(resultFromFactory.from).toEqual(identityA);
    expect(resultFromFactory.to).toEqual([identityB, identityC]);
    expect(resultFromFactory.type).toEqual('connectivityCandidate');
    expect(resultFromFactory.conversationId).toEqual('abc123');
    expect(resultFromFactory.misc).toEqual({ a: 'something'});
    expect(resultFromFactory.id.length).toBe(36);
  });

  it('should return an updateSdp message', () => {
    const resultFromFactory = MessageFactory.updateSdp(identityA, [identityB, identityC], 'abc123', { a: 'something'});
    expect(resultFromFactory instanceof Message).toBeTruthy();
    expect(resultFromFactory.from).toEqual(identityA);
    expect(resultFromFactory.to).toEqual([identityB, identityC]);
    expect(resultFromFactory.type).toEqual('updateSdp');
    expect(resultFromFactory.conversationId).toEqual('abc123');
    expect(resultFromFactory.misc).toEqual({ sdp: { a: 'something'}});
    expect(resultFromFactory.id.length).toBe(36);
  });

  it('should return an presence message', () => {
    const resultFromFactory = MessageFactory.presence(identityA, [identityB, identityC], 'abc123', 'available');
    expect(resultFromFactory instanceof Message).toBeTruthy();
    expect(resultFromFactory.from).toEqual(identityA);
    expect(resultFromFactory.to).toEqual([identityB, identityC]);
    expect(resultFromFactory.type).toEqual('presence');
    expect(resultFromFactory.conversationId).toEqual('abc123');
    expect(resultFromFactory.misc).toEqual({ status: 'available'});
    expect(resultFromFactory.id.length).toBe(36);
  });

});
