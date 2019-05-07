import { IMessagingStub } from './interfaces';
import { Identity } from './Identity';
import { IJsonIdp } from './interfaces';
import { IWebFinger } from './interfaces/webfinger.interface';

/**
 * @desc This class is the central class for resolving identities and exists only once in each wonder instance.
 * The Idp is a singleton object, there will always be just one instance of it, no matter how often the constructor is called.
 */
export class Idp {
  /**
   * @desc containing already known identities.
   */
  private resolvedIdentities: Identity[] = [];

  /**
   * @desc contains the url to the messaging server, which is received from the remote Idp.
   */
  messagingServer: string = null;

  constructor(
    /**
     * @desc The url string to a remote Idp or an string for a well-known IdP like 'webfinger'. Default: webfinger
     */
    public remoteIdp: string,

    /**
     * @desc contains the identity of the local user
     */
    public myIdentity: string
  ) {
    this.remoteIdp = remoteIdp || 'webfinger';
  }

  /**
   * @desc Return an Identity by searching resolved ones XOR resolve them on the fly
   */
  getIdentity(rtcIdentity: string, credentials?: { [key: string]: any } | string): Promise<Identity> {
    const that = this;

    return new Promise((resolve, reject) => {
      if (!rtcIdentity) {
        reject(new Error('[Idp getIdentity] no rtcIdentity parameter'));
      }

      // return the resolved identity if it exists
      that.resolvedIdentities.forEach((identity: Identity) => {
        if (identity.rtcIdentity === rtcIdentity) {
          console.log('[Idp getIdentity] identity already exists in:', that.resolvedIdentities);
          resolve(identity);
          return; // needs to be here because resolve isn't leaving the function
        }
      });


      // otherwise ask the remote idp
      that.askRemoteIdp(rtcIdentity, credentials)
        // both remote idp and msg download server answered correctly
        .then((identity: Identity) => {
          if (identity) {
            resolve(identity);
          } else {
            reject(new Error('[Idp getIdentity] no identity resolved from remote idp'));
          }
        })
        // an error was thrown, possibly due to the network
        .catch((error) => {
          reject(error);
        });

    });
  }

  /**
   * @desc Return an Identities by searching resolved ones XOR resolve them on the fly
   */
  getIdentities(rtcIdentities: [{ rtcIdentity: string; credentials?: any }]): Promise<Identity[]> {
    const resolvedIdentities: Identity[] = [];

    rtcIdentities.forEach(identity => {
      this.getIdentity(identity.rtcIdentity, identity.credentials).then(el => {
        resolvedIdentities.push(el);
      });
    });

    return new Promise((resolve, reject) => {
      resolve(resolvedIdentities);
    });
  }


  /**
   * @desc Resolve an identity by asking the remote idp for information
   */
  private askRemoteIdp(rtcIdentity: string, credentials?: { [key: string]: any } | string): Promise<Identity> {
    return new Promise((resolve, reject) => {
      if (!rtcIdentity) {
        reject(new Error('[Idp askRemoteIdp] no rtcIdentity in parameter'));
      }
      console.log('[Idp askRemoteIdp] asking remote Idp...');

      if (this.remoteIdp === 'webfinger') {
        try {
          const webfinger: typeof import('../../../../../node_modules/webfinger.js/src/webfinger.js') =
          require('../../../../../node_modules/webfinger.js/src/webfinger.js');
          console.log('[Idp askRemoteIdp] webfinger', webfinger);
          return this.askWebFinger(webfinger, rtcIdentity, credentials)
            .then((identity: Identity) => {
              console.log('[Idp askRemoteIdp] webfinger resolved identity', identity);
              resolve(identity);
            });
        } catch (error) {
          reject(new Error(`[Idp askRemoteIdp] webfinger not found ${error}`));
        }
      } else {
        this.askJsonpIdp(rtcIdentity, credentials);
      }
    });
  }

  /**
   * @desc askWebFinger will search for identities using the webfinger protocol
   */
  private askWebFinger(wf: IWebFinger, rtcIdentity: string, credentials?: { [key: string]: any } | string): Promise<Identity> {
    let localMsgStubUrl = null;
    let remoteMsgStubUrl = null;
    let messagingServer = null;
    let remoteMessagingServer = null;
    const codecs = {};

    return new Promise((resolve, reject) => {
      // using the webfinger class

      const webfinger = new wf({
        webfist_fallback: false, // defaults to false, fallback to webfist
        tls_only: false, // defaults to true
        uri_fallback: true, // defaults to false
        request_timeout: 10000, // defaults to 10000
      });

      return webfinger.lookup(rtcIdentity, (err, data) => {
        if (err) {
          reject((new Error(`[Idp askRemoteIdp] error: ${err.message}`)));
        } else {
          console.log('[Idp askRemoteIdp] found Webfinger entry for', rtcIdentity, 'data:', data);

          /**
           * get the MessagingStub URL's
           * possibly there are different URL's for local and remote stubs depending on the domain
           */
          for (const val in data.object.properties) {
            if (data.object.properties.hasOwnProperty(val)) {
              if (data.object.properties[val] === 'localStub') { localMsgStubUrl = val; }
              if (data.object.properties[val] === 'remoteStub') { remoteMsgStubUrl = val; }
              if (data.object.properties[val] === 'messagingServer') { messagingServer = val; }
              if (data.object.properties[val] === 'messagingServer_remote') { remoteMessagingServer = val; }
              if (data.object.properties[val].substr(0, 5) === 'codec') {
                const codecKey = data.object.properties[val].substr(6); // cut 'codec_'
                codecs[codecKey] = val;
              }
            }
          }
          console.log('[Idp askRemoteIdp] extracted codec URIs', codecs);

          if (remoteMsgStubUrl && remoteMessagingServer) {
            const localDomain = this.myIdentity.split('@')[1];
            const requestedDomain = rtcIdentity.split('@')[1];
            if (localDomain !== requestedDomain) {
              console.log(`[Idp askRemoteIdp] using remote MsgStub ${remoteMsgStubUrl} for identity: ${rtcIdentity}`);
              localMsgStubUrl = remoteMsgStubUrl;
              messagingServer = remoteMessagingServer;
            }
          }

          this.getMsgStub(localMsgStubUrl)
            // successfully resolved the messaging stub
            .then((msgStub: IMessagingStub) => {
              const identity = new Identity(
                rtcIdentity,
                this.remoteIdp,
                msgStub,
                localMsgStubUrl,
                messagingServer,
                codecs,
                credentials
              );
              this.resolvedIdentities.push(identity); // store identity in array
              resolve(identity); // return the identity
            })
            // failed to resolve the messaging stub
            .catch((error) => {
              reject(error);
            });
        }
      });
    });
  }


  /**
   * @desc askOtherIdp is trying to connect to an IdP using the given IdP-options
   */
  private askJsonpIdp(rtcIdentity: string, credentials?: { [key: string]: any } | string): Promise<Identity> {
    let localMsgStubUrl = null;
    let messagingServer = null;
    const codecs = {};

    return new Promise((resolve, reject) => {
      import(this.remoteIdp + rtcIdentity).then((data: IJsonIdp) => {
        console.log('[Idp askJsonpIdp] remote idp answered: ', data);
        localMsgStubUrl = data.rows[0].messagingStubURL;
        messagingServer = data.rows[0].messagingServer;

        for (const val in data.rows[0]) {
          if (val.substr(0, 5) === 'codec') {
            const codecKey = val.substr(6); // cut 'codec_'
            codecs[codecKey] = data.rows[0][val];
            console.log('[Idp askRemoteIdp] extracted codec URIs', codecs);
          }
        }

        this.getMsgStub(localMsgStubUrl)
          // successfully resolved the messaging stub
          .then((msgStub: IMessagingStub) => {
            const identity = new Identity(rtcIdentity, this.remoteIdp, msgStub, localMsgStubUrl, messagingServer, codecs, credentials);
            this.resolvedIdentities.push(identity); // store identity in the idp
            resolve(identity); // return the identity
          })
          // failed to resolve the messaging stub
          .catch((error) => {
            reject(new Error(`[Idp askJsonpIdp] the messaging stub could not be loaded for ${rtcIdentity}: ${error}`));
          });
      }, error => {
        reject(new Error(`[Idp askJsonpIdp] the identity could not be resolved from remote idp: ${error}`));
      });
    });
  }

  /**
   * @desc Resolve a messaging stub by asking a stub providing server
   */
  private getMsgStub(localMsgStubUrl: string): Promise<IMessagingStub> {
    console.log('[Idp getMsgStub] asking stub server for an implementation: ', localMsgStubUrl);

    return new Promise((resolve, reject) => {
      import(localMsgStubUrl).then((msgStub: IMessagingStub) => {
        console.log('[Idp getMsgStub] received stub: ', msgStub);
        resolve(msgStub);
      }, error => {
        reject(Error(`
            Idp getMsgStub] messaging stub could not be retrieved from URL;
            possibly a malformed URL or the server is unreachable: ${error}`
        ));
      }
      );
    });
  }
}
