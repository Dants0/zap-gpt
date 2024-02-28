import venom from '@wppconnect-team/wppconnect';

import dotenv from 'dotenv';
import { initializeNewAIChatSession, mainOpenAI } from './service/openai';
import { splitMessages, sendMessagesWithDelay } from './util';
import { mainGoogle } from './service/google';

dotenv.config();
type AIOption = 'GPT' | 'GEMINI';

const messageBufferPerChatId = new Map();
const messageTimeouts = new Map();
const AI_SELECTED: AIOption = (process.env.AI_SELECTED as AIOption) || 'GEMINI';

if (AI_SELECTED === 'GEMINI' && !process.env.GEMINI_KEY) {
  throw Error(
    'Você precisa colocar uma key do Gemini no .env! Crie uma gratuitamente em https://aistudio.google.com/app/apikey?hl=pt-br'
  );
}

if (
  AI_SELECTED === 'GPT' &&
  (!process.env.OPENAI_KEY || !process.env.OPENAI_ASSISTANT)
) {
  throw Error(
    'Para utilizar o GPT você precisa colocar no .env a sua key da openai e o id do seu assistante.'
  );
}

venom
  .create(
    'sessionName',
    (base64Qr, asciiQR, attempts, urlCode) => {
      console.log(asciiQR);
    },
    (statusSession, session) => {
      console.log('Status Session: ', statusSession);
<<<<<<< HEAD
      console.log(session)
    },
    { logQR: false }
=======
    }
>>>>>>> ef4e996606dffd977404b5bfc648411036f20e2a
  )
  .then((client) => {
    start(client);
  })
  .catch((erro) => {
    console.log(erro);
  });

async function start(client: venom.Whatsapp): Promise<void> {
<<<<<<< HEAD
  console.log(client)
  await initializeNewAIChatSession();

  client.onMessage((message) => {
    (async () => {
      if (message.type === 'chat' && !message.isGroupMsg) {
        await getHistoryMessages({
          client,
          history,
          targetNumber: message.from,
        });
        
        messageBuffer.push(message.body);
        console.log(message.from)
=======
  client.onMessage((message) => {
    (async () => {
      if (message.type === 'chat' && !message.isGroupMsg) {
        const chatId = message.chatId;
        console.log('Mensagem recebida:', message.body);
        if (AI_SELECTED === 'GPT') {
          await initializeNewAIChatSession(chatId);
        }

        if (!messageBufferPerChatId.has(chatId)) {
          messageBufferPerChatId.set(chatId, []);
        }
        messageBufferPerChatId.set(chatId, [
          ...messageBufferPerChatId.get(chatId),
          message.body,
        ]);
>>>>>>> ef4e996606dffd977404b5bfc648411036f20e2a

        if (messageTimeouts.has(chatId)) {
          clearTimeout(messageTimeouts.get(chatId));
        }
        console.log('Aguardando novas mensagens...');
        messageTimeouts.set(
          chatId,
          setTimeout(() => {
            (async () => {
              console.log(
                'Gerando resposta para: ',
                [...messageBufferPerChatId.get(chatId)].join(' \n ')
              );
              const currentMessage = [
                ...messageBufferPerChatId.get(chatId),
              ].join(' \n ');
              const answer =
                AI_SELECTED === 'GPT'
                  ? await mainOpenAI({
                      currentMessage,
                      chatId,
                    })
                  : await mainGoogle({
                      currentMessage,
                      chatId,
                    });
              const messages = splitMessages(answer);
              console.log('Enviando mensagens...');
              await sendMessagesWithDelay({
                client,
                messages,
                targetNumber: message.from,
              });
              messageBufferPerChatId.delete(chatId);
              messageTimeouts.delete(chatId);
            })();
          }, 10000)
        );
      }
    })();
  });
}
