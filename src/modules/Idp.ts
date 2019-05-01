import { IMessagingStub } from './interfaces';
import { Identity } from './Identity';
import { WebFinger } from 'webfinger.js';
import { IJsonIdp } from './interfaces';

export class Idp {
  remoteIdp: string;
  resolvedIdentities: Identity[] = [];
  messagingServer: string = null;

  constructor(remoteIdp: string, public myIdentity: string) {
    this.remoteIdp = remoteIdp || 'webfinger';
  }

  getIdentity(rtcIdentity: string, credentials?: Object): Promise<Identity> {
    const that = this;

    return new Promise(function(resolve, reject) {
      if (!rtcIdentity) {
        reject(new Error('[Idp getIdentity] no rtcIdentity parameter'));
      }

      // return the resolved identity if it exists
      for (let i = 0; i < that.resolvedIdentities.length; i++) {
        if (that.resolvedIdentities[i].rtcIdentity === rtcIdentity) {
          console.log('[Idp getIdentity] identity already exists in:', that.resolvedIdentities);
          resolve(that.resolvedIdentities[i]);
          return; // needs to be here because resolve isn't leaving the function
        }
      }


      // otherwise ask the remote idp
      that.askRemoteIdp(rtcIdentity, credentials)
        // both remote idp and msg download server answered correctly
        .then(function(identity) {
          if (identity) {
            resolve(identity);
          } else {
            reject(new Error('[Idp getIdentity] no identity resolved from remote idp'));
          }
        })
        // an error was thrown, possibly due to the network
        .catch(function(error) {
          reject(error);
        });

    });
  }

  askRemoteIdp(rtcIdentity: string, credentials: Object): Promise<Identity> {
    const that = this;
    let localMsgStubUrl = null;
    let remoteMsgStubUrl = null;
    let messagingServer = null;
    let remoteMessagingServer = null;
    let codecs = {};

    return new Promise(function(resolve, reject) {
      if (!rtcIdentity) {
        reject(new Error('[Idp askRemoteIdp] no rtcIdentity in parameter'));
      }
      console.log('[Idp askRemoteIdp] asking remote Idp...');

      if (that.remoteIdp === 'webfinger') {
        import('webfinger.js')
          .then((WebFinger: WebFinger) => {
            askWebFinger();
          }, error => {
            reject(new Error(`[Idp askRemoteIdp] webfinger not found ${error}`));
          });
      } else {
        askJsonpIdp();
      }


      /**
       * askWebFinger will search for identities using the webfinger protocol
       */
      function askWebFinger() {
        // using the webfinger class
        const webfinger = new WebFinger({
          webfist_fallback: false, // defaults to false, fallback to webfist
          tls_only: false, // defaults to true
          uri_fallback: true, // defaults to false
          request_timeout: 10000, // defaults to 10000
        });

        webfinger.lookup(rtcIdentity, function(err, data) {
          if (err) {
            reject((new Error(`[Idp askRemoteIdp] error: ${err.message}`)));
          } else {
            console.log('[Idp askRemoteIdp] found Webfinger entry for ' + rtcIdentity + ': ', data);

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
            };
            console.log('[Idp askRemoteIdp] extracted codec URIs', codecs);

            if ( remoteMsgStubUrl && remoteMessagingServer ) {
                const localDomain = that.myIdentity.split('@')[1];
                const requestedDomain = rtcIdentity.split('@')[1];
                if ( localDomain !== requestedDomain ) {
                    console.log(`[Idp askRemoteIdp] using remote MsgStub ${remoteMsgStubUrl} for identity: ${rtcIdentity}`);
                    localMsgStubUrl = remoteMsgStubUrl;
                    messagingServer = remoteMessagingServer;
                }
            }

            that.getMsgStub(localMsgStubUrl)
              // successfully resolved the messaging stub
              .then(function(msgStub) {
                const identity = new Identity(
                  rtcIdentity,
                  that.remoteIdp,
                  msgStub,
                  localMsgStubUrl,
                  messagingServer,
                  codecs,
                  credentials
                );
                that.resolvedIdentities.push(identity); // store identity in array
                resolve(identity); // return the identity
              })
              // failed to resolve the messaging stub
              .catch(function(error) {
                reject(error);
              });
          }
        });
      }


      /**
       * askOtherIdp is trying to connect to an IdP using the given IdP-options
       */
      function askJsonpIdp() {
        import(that.remoteIdp + rtcIdentity).then((data: IJsonIdp) => {
            console.log('[Idp askJsonpIdp] remote idp answered: ', data);
            localMsgStubUrl = data.rows[0].messagingStubURL;
            messagingServer = data.rows[0].messagingServer;
            codecs = {};

            for (const val in data.rows[0]) {
              if (val.substr(0, 5) === 'codec') {
                const codecKey = val.substr(6); // cut 'codec_'
                codecs[codecKey] = data.rows[0][val];
                console.log('[Idp askRemoteIdp] extracted codec URIs', codecs);
              }
            }

            that.getMsgStub(localMsgStubUrl)
              // successfully resolved the messaging stub
              .then(function(msgStub) {
                const identity = new Identity(rtcIdentity, that.remoteIdp, msgStub, localMsgStubUrl, messagingServer, codecs, credentials);
                that.resolvedIdentities.push(identity); // store identity in the idp
                resolve(identity); // return the identity
              })
              // failed to resolve the messaging stub
              .catch(function(error) {
                reject(new Error(`[Idp askJsonpIdp] the messaging stub could not be loaded for ${rtcIdentity}: ${error}`));
              });
          }, error => {
            reject(new Error(`[Idp askJsonpIdp] the identity could not be resolved from remote idp: ${error}`));
          }
        );
      }


    });
  }

  getMsgStub(localMsgStubUrl: string): Promise<IMessagingStub> {
    const that = this;
    console.log('[Idp getMsgStub] asking stub server for an implementation: ', localMsgStubUrl);



    return new Promise(function(resolve, reject) {
      console.log('test');

      const $script = require('scriptjs');
      $script(localMsgStubUrl, function(res) {
        console.log('loaded', res);
      });

      /*import(['lazy!' + localMsgStubUrl], (mod) => {
        console.log('got stub', mod);
      }, (err) => {
        console.log('error while loading stub', err);
      });*/



      /*import(localMsgStubUrl).then((msgStub: IMessagingStub) => {
          console.log('[Idp getMsgStub] received stub: ', msgStub);
          resolve(msgStub);
        }, error => {
          reject(Error(`
            Idp getMsgStub] messaging stub could not be retrieved from URL;
            possibly a malformed URL or the server is unreachable: ${error}`
          ));
        }
      );*/
    });
  }
}
