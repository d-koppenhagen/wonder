import { Identity } from './Identity';
import { PayloadType } from './Types';
import { ICodec } from './interfaces';
import { DataChannelEvtHandler } from './DataChannelEvtHandler';
import { errorHandler } from './helpfunctions';

/**
 * @desc This class represents a data broker for codecs and their data channels
 */
export class DataChannelBroker {
  /**
   * @desc This is an object containing a map for assigned codecs between a sender and a recipient.
   * The object makes it possible to search a codec instance by going down the hierarchy in the following order:
   * from -> to -> payloadType ->  [ codec | url | dataChannelEvtHandler ]
   * @example
   * { // view of alice (sending direction) begins here
   *  alice: {
   *    bob: {
   *      file: {
   *        url: 'https://example.net:8083/codecs/file.js', // the url to the origin of the codec
   *        dataChannleEvtHandler: DataChannelEvtHandler, // an instance of the event handler
   *        codec: codec // an instance of the codec which includes data channel
   *      },
   *      plain: {
   *        url: 'http://example.org:8083/codecs/plain.js',
   *        dataChannleEvtHandler: DataChannelEvtHandler,
   *        codec: codec
   *      }
   *    }
   *    charlie: {
   *      chat: {
   *        url: 'http://example.com:8083/codecs/chatcodec.js',
   *        dataChannleEvtHandler: DataChannelEvtHandler,
   *        codec: codec
   *      }
   *    }
   *  },
   *  // receiving direction begins here
   *  bob: {
   *    alice: {
   *      file: {
   *        url: 'https://example.net:8083/codecs/fileCodec2.js',
   *        dataChannleEvtHandler: DataChannelEvtHandler,
   *        codec: codec
   *      }
   *    }
   *  },
   *  charlie: {
   *    alice: {
   *      chat: {
   *        url: 'http://charlie.example.net:8083/codecs/charliesChatCodec.js',
   *        dataChannleEvtHandler: DataChannelEvtHandler,
   *        codec: codec
   *      }
   *    }
   *  }
   * }
   */
  codecMap = {};

  /**
   * @desc An object of all available codecs with the codecUrl as a key
   * It contains the instances of each required codec. The codecs are then used to
   * instanciate the codecs in the codecMap so they can be used multiple times.
   * @example
   * {
   *   'http://example.org:8083/chat.js' : chatCodec, // instance of a codec
   *   'https://example.net:8070/file.js' : fileCodec,
   *   'https://example.com:8090/image.js' : imageCodec
   * }
   */
  codecs = {};

  constructor() { }

  /**
   * @desc The function adds a new codec from one peer to another with the codecUrl as the key.
   * @TODO add error handling if no codec is retrieved if(codec == false) ...
   * @TODO check if hasownproperty or try-catch is better suited
   */
  addDataChannelCodec(
    from: Identity,
    to: Identity,
    payloadType: string | boolean,
    dataChannelEvtHandler: DataChannelEvtHandler
  ): Promise<ICodec> {
    let errMsg;

    return new Promise((resolve) => {
      // when no codecs were webfingered from bob or the payloadType doesn't match the codecs
      if (typeof payloadType === 'boolean') {
        if (payloadType) {
          payloadType = PayloadType.plain; // fallback to codec plain
        } else { // alice is requesting a codec this bob doesn't have
          errMsg = new Error('[DataChannelBroker addDataChannelCodec] Payload set to false');
          errorHandler(errMsg);
          return;
        }
      } else if (!to.codecs || !to.codecs[payloadType]) {
        payloadType = PayloadType.plain; // fallback to codec plain
      } else { // alice is requesting a codec this bob doesn't have
        errMsg = new Error('[DataChannelBroker addDataChannelCodec] Payload type not found for the remote participant');
        errorHandler(errMsg);
        return;
      }
      this.getCodec(to.codecs[payloadType]) // get the codec file
        .then((codec: ICodec) => { // iterate through the object and resolve missing hierarchies
          if (!this.codecMap[from.rtcIdentity]) {
            this.codecMap[from.rtcIdentity] = {};
          }
          if (!this.codecMap[from.rtcIdentity][to.rtcIdentity]) {
            this.codecMap[from.rtcIdentity][to.rtcIdentity] = {};
          }
          if (!this.codecMap[from.rtcIdentity][to.rtcIdentity][payloadType]) {
            this.codecMap[from.rtcIdentity][to.rtcIdentity][payloadType] = {};
          }
          this.codecMap[from.rtcIdentity][to.rtcIdentity][payloadType].url = to.codecs[payloadType as string]; // write the url
          this.codecMap[from.rtcIdentity][to.rtcIdentity][payloadType].dataChannelEvtHandler = dataChannelEvtHandler; // save the handler
          resolve(codec); // resolve the promise of addDataChannelCodec
        })
        .catch((error) => {
          errMsg = new Error(`[DataChannelBroker addDataChannelCodec] error saving the codec in the codecMap: ${error}`);
          errorHandler(errMsg);
          return;
        });
    });
  }

  /**
   * @desc Returns a codec and its data channel which is used from one peer to another with the codecUrl as a key
   * @example
   * var codec = dataChannelBroker.getDataChannelCodec(remoteIdentity, myIdentity, 'https://example.com/codecFile.js');
   * @TODO check if hasownproperty or try-catch is better suited
   */
  getDataChannelCodec(from: Identity, to: Identity, payloadType: string | boolean | { [key: string]: any }): ICodec {
    if ((payloadType === 'true') || !payloadType) { payloadType = PayloadType.plain; } // fallback to codec plain
    if (this.codecMap[from.rtcIdentity] &&
      this.codecMap[from.rtcIdentity][to.rtcIdentity] &&
      this.codecMap[from.rtcIdentity][to.rtcIdentity][payloadType.toString()] &&
      this.codecMap[from.rtcIdentity][to.rtcIdentity][payloadType.toString()].url &&
      this.codecs[this.codecMap[from.rtcIdentity][to.rtcIdentity][payloadType.toString()].url]) {
      return this.codecs[this.codecMap[from.rtcIdentity][to.rtcIdentity][payloadType.toString()].url]; // return the codec
    }
  }

  /**
   * @desc Remove a codec and its RTCDataChannel
   * @example
   * var success = dataChannelBroker.removeDataChannelCodec(myIdentity, remoteIdentity, 'http://example.com/codec.js');
   * @TODO check if hasownproperty or try-catch is better suited
   */
  removeDataChannelCodec(from: Identity, to: Identity, payloadType: string): boolean {
    // check if the connection is there
    // check iteratively to avoid exceptions
    if (this.codecMap[from.rtcIdentity] &&
      this.codecMap[from.rtcIdentity][to.rtcIdentity] &&
      this.codecMap[from.rtcIdentity][to.rtcIdentity][payloadType]) {
      delete this.codecMap[from.rtcIdentity][to.rtcIdentity][payloadType];
      return true;
    }
    return false; // if not found
  }

  /**
   * @desc Get a specific codec from the local codec list or from a remote server
   * @example
   * dataChannelBroker.getCodec('https://c.example.net/anyCodec.js')
   * .then(function(codec){
   *   console.log('Codec found: ', codec);
   *   // do something with the codec variable
   * })
   * .catch(function(error){
   *   console.error('Error found: ', error);
   * });
   */
  private getCodec(codecUrl: string): Promise<ICodec> {
    return new Promise((resolve) => {
      // error handling
      if (!codecUrl) {
        errorHandler('[DataChannelBroker getCodec] : no codecUrl specified');
        return;
      }

      // search for the codec by URL
      if (this.codecs && this.codecs[codecUrl]) {
        resolve(this.codecs[codecUrl]);
        return;
      } else { // if it isn't present download the codec with the URL
        import(codecUrl).then((codec: ICodec) => {
          this.codecs[codecUrl] = codec; // save it locally
          resolve(codec); // and return it
        }, error => { // failed to receive the codec
          errorHandler(`[DataChannelBroker getCodec] the codec could not be retrieved from the remote server: ${error}`);
        });
      }
    });
  }

  /**
   * @desc This function removes a codec with a given url to a codec origin.
   * This function may not be needed at all since we may want to be able to
   * preserve every codecs for the application/conversation lifetime.
   * @example var success = dataChannelBroker.removeCodec('https://codecs.example.org/imageCodec.js');
   */
  removeCodec(codecUrl: string): boolean {
    if (this.codecs[codecUrl]) {
      delete this.codecs[codecUrl];
      return true;
    } else {
      return false;
    }
  }
}
