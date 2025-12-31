// In-memory storage for chat conversations
interface Conversation {
  id: number;
  title: string;
  createdAt: Date;
}

interface Message {
  id: number;
  conversationId: number;
  role: string;
  content: string;
  createdAt: Date;
}

let conversationIdCounter = 1;
let messageIdCounter = 1;
const conversationsMap = new Map<number, Conversation>();
const messagesMap = new Map<number, Message[]>();

export interface IChatStorage {
  getConversation(id: number): Promise<Conversation | undefined>;
  getAllConversations(): Promise<Conversation[]>;
  createConversation(title: string): Promise<Conversation>;
  deleteConversation(id: number): Promise<void>;
  getMessagesByConversation(conversationId: number): Promise<Message[]>;
  createMessage(conversationId: number, role: string, content: string): Promise<Message>;
}

export const chatStorage: IChatStorage = {
  async getConversation(id: number) {
    return conversationsMap.get(id);
  },

  async getAllConversations() {
    return Array.from(conversationsMap.values()).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  },

  async createConversation(title: string) {
    const conversation: Conversation = {
      id: conversationIdCounter++,
      title,
      createdAt: new Date(),
    };
    conversationsMap.set(conversation.id, conversation);
    messagesMap.set(conversation.id, []);
    return conversation;
  },

  async deleteConversation(id: number) {
    conversationsMap.delete(id);
    messagesMap.delete(id);
  },

  async getMessagesByConversation(conversationId: number) {
    return messagesMap.get(conversationId) || [];
  },

  async createMessage(conversationId: number, role: string, content: string) {
    const message: Message = {
      id: messageIdCounter++,
      conversationId,
      role,
      content,
      createdAt: new Date(),
    };
    const messages = messagesMap.get(conversationId) || [];
    messages.push(message);
    messagesMap.set(conversationId, messages);
    return message;
  },
};
