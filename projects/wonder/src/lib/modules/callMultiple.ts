import { Wonder } from '../wonder';
import { IDemand } from './interfaces';
import { Participant } from './Participant';
import { Conversation } from './Conversation';

export class CallMultiple {
  static call(wonderInstance: Wonder, recipients: string[], conversation: Conversation, demand: IDemand) {
    return new Promise((resolve, reject) => {

      console.log('[callMultiple] Multiparty call to', recipients, 'with', demand);

      if (!(recipients instanceof Array)) {
        return new Error('recipients has to be an array of Receipient');
      }

      // create remote identity and participant
      recipients.forEach(recipient => {
        wonderInstance.localIdp.getIdentity(recipient)
          .then((identity) => {
            conversation.owner = conversation.myParticipant; // set me to the owner as i started the conversation
            const participant = new Participant(wonderInstance, identity, demand);
            conversation.remoteParticipants.push(participant); // set the conversation's participants
            resolve(conversation.id);
          }).catch((error) => {
            reject(new Error(`[callMultiple] error: ${error}`));
          });
      });
    });
  }
}
