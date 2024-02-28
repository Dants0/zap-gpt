import OpenAI from 'openai';
import dotenv from 'dotenv';
dotenv.config();

let assistant: OpenAI.Beta.Assistants.Assistant;
let thread: OpenAI.Beta.Threads.Thread;


const openai = new OpenAI({
  apiKey: process.env.OPENAI_KEY,
});

export async function initializeNewAIChatSession(): Promise<void> {
  assistant = await openai.beta.assistants.retrieve(
    process.env.OPENAI_ASSISTANT!
    );
    thread = await openai.beta.threads.create();
  console.log(assistant.instructions)
}

export async function mainOpenAI({
  currentMessage,
  name,
  triggerName // Novo parâmetro para verificar o nome específico
}: {
  currentMessage: string;
  name: string;
  triggerName: string; // Novo parâmetro para verificar o nome específico
}): Promise<string> {
  // Verificar se a mensagem contém o nome específico
  if (!currentMessage.toLowerCase().includes(triggerName.toLowerCase())) {
    return 'Desculpe, você não está autorizado a chamar o GPT.';
  }

  const instructions = `${assistant.instructions}\nVocê está falando com ${name}.`;

  // Criar um novo thread para cada interação
  const newThread = await openai.beta.threads.create();

  await openai.beta.threads.messages.create(newThread.id, {
    role: 'user',
    content: currentMessage,
  });

  const run = await openai.beta.threads.runs.create(newThread.id, {
    assistant_id: assistant.id,
    instructions,
  });

  // Aguardar até que o modelo forneça uma resposta
  const messages = await checkRunStatus({
    threadId: newThread.id,
    runId: run.id,
  });

  // Extrair e retornar a primeira resposta do modelo
  const responseAI = messages.data[0].content[0] as OpenAI.Beta.Threads.Messages.MessageContentText;
  return responseAI.text.value;
}



async function checkRunStatus({
  threadId,
  runId,
}: {
  threadId: string;
  runId: string;
}): Promise<OpenAI.Beta.Threads.Messages.ThreadMessagesPage> {
  return await new Promise((resolve, _reject) => {
    const verify = async (): Promise<void> => {
      const runStatus = await openai.beta.threads.runs.retrieve(
        threadId,
        runId
      );

      if (runStatus.status === 'completed') {
        const messages = await openai.beta.threads.messages.list(threadId);
        resolve(messages);
      } else {
        console.log('Aguardando resposta da OpenAI...');
        setTimeout(verify, 3000);
      }
    };

    verify();
  });
}
