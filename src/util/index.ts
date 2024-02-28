import type venom from 'venom-bot';

export function splitMessages(text: string): string[] {
  const matches = text.match(/[^.?!]+[.?!]+["']?|[^.?!]+$/g);
  return matches ?? [];
}

export async function sendMessagesWithDelay({
  messages,
  delay,
  client,
  targetNumber,
}: {
  messages: string[];
  delay: number;
  client: venom.Whatsapp;
  targetNumber: string;
}): Promise<void> {
  for (const [index, msg] of messages.entries()) {
    await new Promise((resolve) => setTimeout(resolve, index * delay));
    client
      .sendText(targetNumber, msg.trimStart())
      .then((result) => {
        console.log('Mensagem enviada:', result);
      })
      .catch((erro) => {
        console.error('Erro ao enviar mensagem:', erro);
      });
  }
}

export async function getHistoryMessages({
  targetNumber,
  client,
  history,
}: {
  targetNumber: string;
  client: venom.Whatsapp;
  history: string[];
}): Promise<void> {
  if (history.length > 0) return;
  const historyInternal = await client.getAllMessagesInChat(
    targetNumber,
    true,
    false
  );
  const textMessages = historyInternal
    .filter((msg) => msg.type === 'chat')
    .slice(-30)
    .map((msg) => {
      const isFromMe = msg.from === '555192194386@c.us';
      return `${
        isFromMe ? 'mensagem guilherme' : `mensagem ${msg.sender.shortName}`
      }: ${msg.body}`;
    });
  history = textMessages;
}
