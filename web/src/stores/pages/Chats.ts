import type { ChatPreview, ChatMessage } from "@interfaces/Chat";
import { atom, map } from "nanostores";

export const ChatsStore = atom<ChatPreview[]>([]);
export const ChatMessagesStore = map<Record<number, ChatMessage[]>>({});

export function updateChats(chats: ChatPreview[]): void {
  ChatsStore.set(chats);
}

export function addChat(chat: ChatPreview): void {
  const currentChats = ChatsStore.get();
  
  // Check if chat already exists, replace it if so
  const chatExists = currentChats.findIndex(c => c.id === chat.id) !== -1;
  
  if (chatExists) {
    updateChat(chat);
  } else {
    ChatsStore.set([chat, ...currentChats]);
  }
}

export function updateChat(chat: ChatPreview): void {
  const currentChats = ChatsStore.get();
  const updatedChats = currentChats.map(c => 
    c.id === chat.id ? chat : c
  );
  ChatsStore.set(updatedChats);
}

export function addMessage(chatId: number, message: ChatMessage): void {
  const currentMessages = ChatMessagesStore.get()[chatId] || [];
  ChatMessagesStore.setKey(chatId, [...currentMessages, message]);
  
  // Also update last message in chat preview
  const currentChats = ChatsStore.get();
  const chatIndex = currentChats.findIndex(chat => chat.id === chatId);
  
  if (chatIndex !== -1) {
    const updatedChat = {
      ...currentChats[chatIndex],
      last_message: message.content
    };
    
    const newChats = [...currentChats];
    newChats[chatIndex] = updatedChat;
    ChatsStore.set(newChats);
  }
}

export function setMessages(chatId: number, messages: ChatMessage[]): void {
  ChatMessagesStore.setKey(chatId, messages);
}

export function markMessageAsViewed(chatId: number, messageIndex: number): void {
  const currentMessages = ChatMessagesStore.get()[chatId] || [];
  
  if (messageIndex >= 0 && messageIndex < currentMessages.length) {
    const updatedMessages = [...currentMessages];
    updatedMessages[messageIndex] = {
      ...updatedMessages[messageIndex],
      viewed: true
    };
    
    ChatMessagesStore.setKey(chatId, updatedMessages);
  }
}

export function markAllMessagesAsViewed(chatId: number): void {
  const currentMessages = ChatMessagesStore.get()[chatId] || [];
  
  if (currentMessages.length > 0) {
    const updatedMessages = currentMessages.map(message => ({
      ...message,
      viewed: true
    }));
    
    ChatMessagesStore.setKey(chatId, updatedMessages);
  }
}