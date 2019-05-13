import { Wonder } from '../wonder';
import { IDemand } from './interfaces';
import { Demand } from './Demand';
import { RtcEvtType } from './Types';
import { Participant } from './Participant';
import { Conversation } from './Conversation';
import { MessageFactory } from './MessageFactory';
import { errorHandler } from './helpfunctions';

export class CallSingle {
  static call(wonderInstance: Wonder, recipient: string, conversation: Conversation, demand: IDemand): Promise<string> {
    return new Promise((resolve) => {
      console.log(conversation);

      // create remote identity and participant
      wonderInstance.localIdp.getIdentity(recipient)
        .then((identity) => {
          const participant = new Participant(wonderInstance, identity, demand);
          conversation.remoteParticipants.push(participant); // set the conversation's participants
          conversation.msgSrv = identity.msgSrv; // use the recipient's messaging server
          if (conversation.msgSrv === conversation.myParticipant.identity.msgSrv) {
            // remote identity exists on the same server as mine
            conversation.msgStub = conversation.myParticipant.identity.msgStub;
            console.log('[callSingle] already connected to the remote participants msgServer');
          } else {
            // if its another server create a new connection
            conversation.msgStub = identity.msgStub.constructor(); // use the remote identity's msgStub
            // connect the stub of the conversation to the remote server
            conversation.msgStub.connect(
              wonderInstance.myIdentity.rtcIdentity, // use my rtcIdentity to connect to the remote server
              participant.identity.credentials, // use the remote participants credentials for that
              participant.identity.msgSrv, // the destination messaging server
              () => { // successfully connected
                console.log('[callSingle] connected to REMOTE PARTICIPANTs msgServer');
                resolve(conversation.id);
                return conversation.id;
              }
            );
          }

          // set the conversation's messaging event handler for every message coming throuh the messaing server
          conversation.msgStub.onMessage = conversation.msgEvtHandler.onMessage.bind(conversation.msgEvtHandler);
        })
        .catch((error) => {
          errorHandler(`[callSingle] error: ${error}`);
        }) // Promise of getIdentity is over here

        // take the promise from getIdentity
        .then((conversationId) => {
          // needs to be here when data audio and video are requested all together
          new Demand(demand).updateDemandDisallow(demand, { in: { data: true }, out: { data: true } });

          navigator.mediaDevices.getUserMedia(demand.out)
            .then((stream: MediaStream) => {
              const evt = {
                type: RtcEvtType.onaddlocalstream,
                candidate: null,
                channel: stream
              };
              conversation.rtcEvtHandler.onEvt(evt);
              stream.getTracks().forEach((track) => { // add the stream to the peer connection to send it later on
                conversation.myParticipant.peerConnection.addTrack(track, stream);
              });
            })
            .then(() => {
              return conversation.myParticipant.peerConnection.createOffer().then((offer: RTCSessionDescriptionInit) => {
                console.log('[callSingle] offer from alice: ', offer.sdp);
                return conversation.myParticipant.peerConnection.setLocalDescription(offer);
              });
            })
            .then(() => {
              console.log('[callSingle] local description success');
              const msg = MessageFactory.invitation( // create the message for the remote participant
                conversation.myParticipant.identity,
                conversation.remoteParticipants[0].identity,
                conversation.id,
                conversation.myParticipant.demand, // also send the demand so bob knows what to expect from alice
                conversation.myParticipant.peerConnection.localDescription // include the sdp offer for bob
              );
              conversation.msgStub.sendMessage(msg); // and send the mesage
            })
            .catch(errorHandler);
          resolve(conversation.id); // return the conversationId if everything went right
        });
    });
  }
}
