import { createContext, useState } from "react";
import { Prompt } from "../constants/messageConstants";

export type Message = {
  user: string;
  ai: string;
  type: "text" | "section" | "cluster";
};

type MessageContextProps = {
  messages: Message[] | [];
  addMessage: (newMessage: Message) => void;
  updateResponse: (newResponse: string) => void;
  prompt?: Prompt;
  updatePrompt: (newPrompt: Prompt) => void;
};

/**
 * Message context to manage the message state between the user and the AI.
 * The context is updated when the openAI response streaming finishes,
 * and when the user submits a new prompt through the PromptBox.
 */
export const MessageContext = createContext<MessageContextProps>(
  {} as MessageContextProps);

/**
 * Message context provider to manage the message state between the user and the AI.
 */
export function MessageContextProvider({children} : {children: React.ReactNode;}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [prompt, setPrompt] = useState<Prompt>();

  const addMessage = (newMessage: Message) => {
    setMessages((prev) => [...prev, newMessage]);
  };

  // Update the last message's response (ai)
  const updateResponse = (newResponse: string) => {
    setMessages((prev) => [
      ...prev.slice(0, prev.length - 1),
      { ...prev[prev.length - 1], ai: newResponse },
    ]);
  };

  // Update the last message's prompt (user)
  const updatePrompt = (newPrompt: Prompt) => {
    setPrompt(newPrompt);

    if (newPrompt.type === "text") {
      setMessages((prev) => [
        ...prev.slice(0, prev.length - 1),
        { ...prev[prev.length - 1], user: newPrompt.content as string },
      ]);
    }
  };

  return (
    <MessageContext.Provider
      value={{
        messages,
        addMessage,
        updateResponse,
        prompt,
        updatePrompt,
      }}
    >
      {children}
    </MessageContext.Provider>
  );
}