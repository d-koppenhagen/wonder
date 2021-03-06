import { Wonder } from '../wonder';
import { guid, errorHandler } from './helpfunctions';
import { IDemand } from './interfaces';
import { Identity } from './Identity';
import { Participant } from './Participant';
import { Conversation } from './Conversation';
import { MessageFactory } from './MessageFactory';
import { DataChannelBroker } from './DataChannelBroker';
import { DataChannelEvtHandler } from './DataChannelEvtHandler';

export class DataChannel {
  static establish(
    wonderInstance: Wonder,
    recipient: string,
    conversation: Conversation,
    payloadType: string | boolean
  ): Promise<string> {
    if (typeof recipient !== 'string') {
      errorHandler('[DataChannel establish] receipient has to be a string');
      return;
    }

    // create remote identity and participant
    wonderInstance.localIdp
      .getIdentity(recipient)
      .then((identity) => {

        // check if the remote participant exists
        let participant = conversation.getRemoteParticipant(identity);

        // if a Data-Channel to that participant/identity wasn't created already
        if (!participant) {
          const dem: IDemand = {
            in: { data: payloadType },
            out: { data: payloadType }
          };
          participant = new Participant(wonderInstance, identity, dem); // create a new participant
          conversation.addRemoteParticipant(participant); // set the conversation's participants
          conversation.msgSrv = identity.msgSrv; // use the recipient's messaging server
        }

        // check if we are already on the same messaging server as the remote participant
        if (conversation.msgSrv === conversation.myParticipant.identity.msgSrv) {
          // remote identity exists on the same server as mine
          conversation.msgStub = conversation.myParticipant.identity.msgStub; // so use my connection
          console.log('[dataChannel] already connected to the remote participants msgServer');
          return;
        } else {
          // if it is another server then create a new connection
          conversation.msgStub = identity.msgStub.constructor(); // use the remote identity's msgStub

          // connect the stub of the conversation to the remote server
          conversation.msgStub.connect(
            wonderInstance.myIdentity.rtcIdentity, // use my rtcIdentity to connect to the remote server
            participant.identity.credentials, // use the remote participants credentials for that
            participant.identity.msgSrv, // the destination messaging server
            () => { // successfully connected
              console.log('[dataChannel] connected to remote participants msgServer');
              return;
            }
          );
        }
        return identity; // pass identity to next .then-function
      })
      .catch((error) => {
        errorHandler(`[DataChannel] error: ${error}`);
      }) // promise of getIdentity is over here

      // take the promise from getIdentity
      .then((identity: Identity) => {
        // set the conversation's messaging event handler for every message coming through the messaing server
        conversation.msgStub.onMessage = conversation.msgEvtHandler.onMessage.bind(conversation.msgEvtHandler);

        // assign the dataChannelBroker to the conversation for later reference
        conversation.dataChannelBroker = new DataChannelBroker();

        // create a new data channel handler for every data channel
        const dataChannelEvtHandler = new DataChannelEvtHandler(wonderInstance, conversation);

        // download a new codec; add it to the broker; add the event handler to the codec
        return conversation.dataChannelBroker.addDataChannelCodec(
          conversation.myParticipant.identity, // from me
          identity, // to the remote participant
          payloadType, // with the codec of the remote participant || or plain
          dataChannelEvtHandler // and the handler of the channel
        ).then((codec) => {
          // get the codec
          codec = conversation.dataChannelBroker.getDataChannelCodec(conversation.myParticipant.identity, identity, payloadType);

          // overwrite the codec with the help of its constructor
          // create the datachannel and assign it to the codec
          codec.dataChannel = conversation.myParticipant.peerConnection.createDataChannel(guid());
          // codec.dataChannel.payloadType = payloadType;
          // register the handler which will receive the message after the codec is finished decoding the message
          codec.onDataMessage = dataChannelEvtHandler.onEvt.bind(dataChannelEvtHandler);
          codec.from = conversation.myParticipant.identity; // tell the codec from whom messages are coming to be sent over the channel
          codec.to = identity; // tell the codec who the receiver is, can be helpful i.e. for chat communication

          // also register the dataChannel in its handler for easier reference
          dataChannelEvtHandler.dataChannel = codec.dataChannel;

          // override the functions which may be defined in the required codec to standard ones for correct functionality
          // when the data channel is ready then assign the codec's onDataMessage function to the channel
          codec.dataChannel.onopen = (evt) => {
            if (codec.dataChannel.readyState === 'open') {
              codec.dataChannel.onmessage = codec.onDataMessage.bind(codec);
            }
          };

          // register the data channel handler and bind its class as 'this' inside the function
          codec.dataChannel.onclose = dataChannelEvtHandler.onEvt.bind(dataChannelEvtHandler);
          // attach the data channel to the conversation for testing
          // conversation.dc = codec.dataChannel; // TODO: THIS NEEDS TO BE HANDELED LATER ON!!!!

          // TODO: THIS NEEDS TO BE DONE EVERY TIME A PEERCONNECTION IS CREATED
          // ondatachannel is a rtcEvent and therefore needs to be handled there
          conversation.myParticipant.peerConnection.ondatachannel = conversation.rtcEvtHandler.onEvt.bind(conversation.rtcEvtHandler);

          conversation.myParticipant.peerConnection.createOffer()
            .then((offer: RTCSessionDescriptionInit) => {
              console.log('[dataChannel createOffer] offer from alice: ', offer.sdp);
              return conversation.myParticipant.peerConnection.setLocalDescription(offer);
            })
            .then(() => {
              console.log('[dataChannel createOffer] local description success');
              const msg = MessageFactory.invitation( // create the message for the remote participant
                conversation.myParticipant.identity,
                conversation.remoteParticipants[0].identity,
                conversation.id,
                conversation.remoteParticipants[0].demand, // also send the demand so bob knows what to expect from alice
                conversation.myParticipant.peerConnection.localDescription // include the sdp offer for bob
              );
              conversation.msgStub.sendMessage(msg); // and send the message
            })
            .catch(errorHandler);
          return conversation.id; // return the conversationId if everything went right
        },
        // DataChannelBroker download failed
        (error) => {
          errorHandler(`[dataChannel] dataChannelBroker requiring failed:  ${error}`);
        });
      }) // addDataChannelCodec promise ends here
      .catch((error) => {
        errorHandler(error);
      });
  }
}
