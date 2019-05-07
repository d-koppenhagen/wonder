import { IMessagingStub } from './interfaces';
import { PayloadType } from './Types';

/**
 * @desc This class represents an identity.
 * The identity is the view of the WONDER framework of a user's representation
 * and will be filled with information coming from the identity provider.
 */
export class Identity {
  constructor(
    /**
     * @desc The username including the domain of the Identity
     * @example alice@example.com
     */
    public rtcIdentity: string,

    /**
     * @desc The URL to the remote Idp
     * @example 'webfinger' // recommended
     * 'http://example.net/idp.php?user='
     */
    public remoteIdp: string,

    /**
     * @desc The instance of the messaging stub of the identity's domain
     * which will be used to connect the identity to it's messaging server;
     * it will also be used to communicate with the messaging server
     * @example
     * define(function(require, exports, module) {
     *   class MessagingStubOfExampleDomain {
     *     constructor() {
     *       this.onMessage = null; // message event handler will use this to register itself on the stub
     *     }
     *     connect(rtcIdentity, credentials, msgSrv, callback) {
     *       // ...
     *       this.websocket.onmessage = function(msg) {
     *         // ...
     *         that.onMessage(msg); // give the message as a JSON-object to the registered function to process it in wonder
     *       };
     *       // ...
     *     }
     *     sendMessage(message) { ... }
     *     disconnect() { ... }
     *   }
     *   return new MessagingStubOfExampleDomain();
     * });
     */
    public msgStub: IMessagingStub,

    /**
     * @desc The URL to the location where the messagingStub was downloaded from
     * @example 'http://example.net:8082/stubsDirectory/MessagingStubOfExampleDomain.js'
     */
    public msgStubUrl: string,

    /**
     * @desc The URL to the messaging server of the identity's domain
     * @example 'ws://example.org:12345'
     */
    public msgSrv: string,

    /**
     * @desc An object containing payloadtypes as keys to the links of codec libraries
     * @example
     * { chat: 'http://example.net:8083/codecs/chat.js'
     *   file: 'http://example.net:8083/codecs/file.js' }
     */
    public codecs?: { [key in PayloadType]?: string },

    /**
     * @desc An object containing credentials for the identity;
     * can be used to be able to login to the identity's messaging server
     * @example // ims login example
     * { 'privid' : 'identifier@subdomain.example.org:1234',
     *   'pubid' : 'pudIdentifier',
     *   'proxy' : '10.11.12.13:12333',
     *   'pwd' : 'userPassword'                              }
     */
    public credentials?: any
  ) { }
}
