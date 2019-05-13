import { Codec } from './CodecPlain';

describe('Codec', () => {
  let codec: Codec;
  let onMessage;

  beforeEach(() => {
    const pc = new RTCPeerConnection();
    const channel = pc.createDataChannel('plain');
    onMessage = (data: string) => {};
    codec = new Codec(channel, onMessage);
  });

  it('should return a codec instance', () => {
    expect(codec instanceof Codec).toBeTruthy();
  });

  it('should process incoming data messages', () => {
    spyOn(codec, 'onMessage');
    codec.onDataMessage('message');
    expect(codec.onMessage).toHaveBeenCalledWith('message');
  });

  it('should send a message through passed datachannel', () => {
    const pc2 = new RTCPeerConnection();
    const channel2 = pc2.createDataChannel('something');
    spyOn(channel2, 'send');

    codec.send('message', channel2);
    expect(channel2.send).toHaveBeenCalledWith('message');
  });

  it('should send a message through constructed datachannel', () => {
    spyOn(codec.dataChannel, 'send');

    codec.send('message', codec.dataChannel);
    expect(codec.dataChannel.send).toHaveBeenCalledWith('message');
  });

  it('should send a JSON message as string through datachannel', () => {
    spyOn(codec.dataChannel, 'send');

    codec.send('{ key: "data", key2: ["data2"] }', codec.dataChannel);
    expect(codec.dataChannel.send).toHaveBeenCalledWith('{ key: "data", key2: ["data2"] }');
  });

});
