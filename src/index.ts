import venom from 'venom-bot';

import dotenv from 'dotenv';
import { initializeNewAIChatSession, mainOpenAI } from './service/openai';
import {
  getHistoryMessages,
  splitMessages,
  sendMessagesWithDelay,
} from './util';

dotenv.config();

let messageBuffer = [] as string[];
let messageTimer: NodeJS.Timeout;

const history = [] as string[];

venom
  .create(
    'sessionName',
    (base64Qr, asciiQR, attempts, urlCode) => {
      console.log(asciiQR);
    },
    (statusSession, session) => {
      console.log('Status Session: ', statusSession);
      console.log(session);
    },
    { logQR: false }
  )
  .then((client) => {
    start(client);
  })
  .catch((erro) => {
    console.log(erro);
  });

let pendingResponse: { [key: string]: boolean } = {};

async function start(client: venom.Whatsapp): Promise<void> {
  await initializeNewAIChatSession();

  client.onMessage(async (message) => {
    // Verificar se a mensagem é de um chat pessoal ou de um grupo
  
    if (message.type === 'chat' || message.isGroupMsg) {
      const targetNumber = message.isGroupMsg ? message.chatId : message.from;

      await getHistoryMessages({
        client,
        history,
        targetNumber,
      });

      messageBuffer.push(message.body);

      clearTimeout(messageTimer);
      messageTimer = setTimeout(async () => {
        const prompt = messageBuffer.join('\n');

        // Verificar se já há uma resposta pendente para este prompt
        if (!pendingResponse[prompt]) {
          pendingResponse[prompt] = true;

          const answer = await mainOpenAI({
            currentMessage: prompt,
            name: message.sender.name,
            triggerName: 'Juca: ',
          });

          delete pendingResponse[prompt]; // Remover a resposta pendente após obtê-la

          const messages = splitMessages(answer);
          const delay = 3000;
          await sendMessagesWithDelay({
            client,
            delay,
            messages,
            targetNumber,
          });
        }

        messageBuffer = [];
      }, 10000);
    }
  });
}
