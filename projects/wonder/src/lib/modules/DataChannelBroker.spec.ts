import { DataChannelBroker } from './DataChannelBroker';
import { Identity } from './Identity';
import { Codec } from './CodecPlain';

class DataChannelEvtHandlerMock {
  dataChannel;
  constructor(
    public wonderInstance,
    public conversation
  ) {}
  onEvt() {}
}

describe('DataChannelBroker', () => {
  let dataChannelBroker: DataChannelBroker;
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

  const expectedAllTrue = {
    in: { audio: true, video: true, data: true },
    out: { audio: true, video: true, data: true }
  };

  beforeEach(() => {
    dataChannelBroker = new DataChannelBroker();
  });

  it('should return a DataChannelBroker instance', () => {
    expect(dataChannelBroker instanceof DataChannelBroker).toBeTruthy();
    expect(dataChannelBroker.codecMap).toEqual({});
    expect(dataChannelBroker.codecs).toEqual({});
  });

  it('should add a codec', () => {
    dataChannelBroker.addDataChannelCodec(identityA, identityB, true, new DataChannelEvtHandlerMock(null, null))
      .then((res) => {
        expect(res instanceof Codec).toBeTruthy();
      });
  });

});
