import { Idp } from './Idp';

describe('Idp', () => {

  it('should create the idp class and use webfinger by default', () => {
    const idp = new Idp(
      '',
      'alice@mydomain.com'
    );
    expect(idp).toBeDefined();
    expect(idp instanceof Idp).toBeTruthy();
    expect(idp.remoteIdp).toBe('webfinger');
    expect(idp.myIdentity).toBe('alice@mydomain.com');
    expect(idp.messagingServer).toBeNull();
  });

  it('should resolve an identity', () => {
    const idp = new Idp(
      'webfinger',
      'alice@id.d-koppenhagen.de'
    );

    /*
    idp.getIdentity('bob@id.d-koppenhagen.de').then((identiy) => {
      console.log(identiy);
      expect(identiy).toBeDefined();
    });*/

  });

});
