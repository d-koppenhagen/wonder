declare const System: any;

import { Wonder } from '../wonder';
import { Identity } from './Identity';
import { PayloadType } from './Types';
import { DataChannelEvtHandler } from './DataChannelEvtHandler';

export class DataChannelBroker {
  codecMap = {};
  codecs = {};

  addDataChannelCodec(
    from: Identity,
    to: Identity,
    payloadType: string,
    dataChannelEvtHandler: DataChannelEvtHandler
  ): Promise<any> {
    const that = this;
    let errMsg;

    return new Promise(function (resolve, reject) {
      // when no codecs were webfingered from bob or the payloadType doesn't match the codecs
      if (!to.codecs || !to.codecs[payloadType]) {
        // check if the codec doesn't matter
        if (payloadType === 'true') {
          payloadType = PayloadType.plain; // fallback to codec plain
        } else { // alice is requesting a codec that bob doesn't have
          errMsg = new Error('[DataChannelBroker addDataChannelCodec] Payload type not found for the remote participant');
          reject(errMsg);
          return errMsg;
        }
      } // else payload type found

      that.getCodec(to.codecs[payloadType]) // get the codec file
        .then(function (codec) { // iterate through the object and resolve missing hierarchies
          if (!that.codecMap[from.rtcIdentity]) {
            that.codecMap[from.rtcIdentity] = {};
          }
          if (!that.codecMap[from.rtcIdentity][to.rtcIdentity]) {
            that.codecMap[from.rtcIdentity][to.rtcIdentity] = {};
          }
          if (!that.codecMap[from.rtcIdentity][to.rtcIdentity][payloadType]) {
            that.codecMap[from.rtcIdentity][to.rtcIdentity][payloadType] = {};
          }
          that.codecMap[from.rtcIdentity][to.rtcIdentity][payloadType].url = to.codecs[payloadType]; // write the url
          that.codecMap[from.rtcIdentity][to.rtcIdentity][payloadType].dataChannelEvtHandler = dataChannelEvtHandler; // save the handler
          resolve(codec); // resolve the promise of addDataChannelCodec
        })
        .catch(function (error) {
          errMsg = new Error(`[DataChannelBroker addDataChannelCodec] error saving the codec in the codecMap: ${error}`);
          reject(errMsg);
          return errMsg;
        });
    });
  }

  getDataChannelCodec(from: Identity, to: Identity, payloadType: string | Boolean): Promise<{}> | false {
    if ((payloadType === 'true') || !payloadType) { payloadType = PayloadType.plain; } // fallback to codec plain
    if (this.codecMap[from.rtcIdentity] &&
      this.codecMap[from.rtcIdentity][to.rtcIdentity] &&
      this.codecMap[from.rtcIdentity][to.rtcIdentity][payloadType.toString()] &&
      this.codecMap[from.rtcIdentity][to.rtcIdentity][payloadType.toString()].url &&
      this.codecs[this.codecMap[from.rtcIdentity][to.rtcIdentity][payloadType.toString()].url]) {
      return this.codecs[this.codecMap[from.rtcIdentity][to.rtcIdentity][payloadType.toString()].url]; // return the codec
    }
    return false; // if not found
  }

  removeDataChannelCodec(from: Identity, to: Identity, payloadType: string): Boolean {
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

  getCodec(codecUrl: string): Promise<Object> {
    const that = this;

    return new Promise(function (resolve, reject) {
      // error handling
      if (!codecUrl) {
        reject(Error('[DataChannelBroker getCodec] : no codecUrl specified'));
        return;
      }

      // search for the codec by URL
      if (that.codecs && that.codecs[codecUrl]) {
        resolve(that.codecs[codecUrl]);
        return;
      } else { // if it isn't present download the codec with the URL
        System.import(codecUrl).then(codec => {
          that.codecs[codecUrl] = codec; // save it locally
          resolve(codec); // and return it
        }, error => { // failed to receive the codec
          reject(new Error(`[DataChannelBroker getCodec] the codec could not be retrieved from the remote server: ${error}`));
        });
      }
    });
  }

  removeCodec(codecUrl: string): Boolean {
    if (this.codecs[codecUrl]) {
      delete this.codecs[codecUrl];
      return true;
    } else {
      return false;
    }
  }
}
