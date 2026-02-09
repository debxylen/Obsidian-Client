export interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: string;
}

export interface Category {
  id: string;
  name: string;
  conversations: Conversation[];
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
  fullDate?: string;
  isAI: boolean;
  variantInfo?: {
    current: number;
    total: number;
    hasVariants: boolean;
    parentId: string;
  };
}

export const categories: Category[] = [];

export const messages: Message[] = [];
