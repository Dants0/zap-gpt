import { mainOpenAI } from "../service/openai";

(async (messageBuffer: any, history: any, message: any) => {
    const answer = await mainOpenAI({
        currentMessage: messageBuffer.join(' \n '),
        name: message.sender.name,
        triggerName: "Juca: "
      });    
})