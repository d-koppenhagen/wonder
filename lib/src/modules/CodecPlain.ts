import { ICodec } from './interfaces';

/**
 * @desc A Codec for plain text
 */
export class Codec implements ICodec {
  constructor(
    /**
     * @desc an datachannel where the codec should be established
     */
    public dataChannel: RTCDataChannel,

    /**
     * @desc The linked onmessage function for processing data result
     */
    public onMessage: (data: string) => void
  ) { }

  /**
   * send function
   */
  send(input: string, dataChannel?: RTCDataChannel) {
    console.log('[Codec Plain] send:', input, dataChannel);
    const output = this.isJSON(input) ? JSON.stringify(input) : input;
    if (dataChannel) { // when used as a general codec for many data channels
      dataChannel.send(output);
    } else { // when instanciated only for a particular channel
      this.dataChannel.send(output);
    }
  }

  /**
   * onDataMessage function
   * @desc This is the function which will be registered on the DataChannel.onmessage-function
   * @desc This function needs to modify the incoming message and send it to this.onMessage afterwards
   */
  onDataMessage(dataMsg: string) {
    console.log('[Codec Plain] onData:', dataMsg);
    this.onMessage(dataMsg);
  }

  /**
   * isJSON function
   * @desc Determines if the input string contains a JSON message
   */
  private isJSON(str: string) {
    try {
      return (JSON.parse(str) && !!str);
    } catch (e) {
      return false;
    }
  }

}

