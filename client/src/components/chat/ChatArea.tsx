import { useRef, useEffect, useCallback, useMemo, useState } from 'react';
import { ChatHeader } from './ChatHeader';
import { Loader2, AlertTriangle, RefreshCw } from 'lucide-react';
import { MessageInput } from './MessageInput';
import { MessageList } from './MessageList';
import { EmptyChatState } from './EmptyChatState';
import { useConversationDetail, getThread } from '@/hooks/useConversationDetail';
import { useChatContext } from '@/context/ChatContext';
import type { Message } from '@/data/mockData';

interface ChatAreaProps {
  activeConversationId: string;
}

export function ChatArea({ activeConversationId }: ChatAreaProps) {
  const {
    streamingMessage,
    error: streamError,
    pendingUserMessage,
  } = useChatContext();

  const FALLBACK_CHAT_HEADER = 'Obsidian';

  const { data, isLoading, error, refetch } = useConversationDetail(activeConversationId);

  const [currentLeafId, setCurrentLeafId] = useState<string | null>(null);

  useEffect(() => {
    if (data?.current_node) {
      setCurrentLeafId(data.current_node);
    }
  }, [data?.current_node, activeConversationId]);

  const bottomRef = useRef<HTMLDivElement>(null);

  const messages = useMemo(() => {

    if (!activeConversationId) {
      let msgs: Message[] = [];
      if (pendingUserMessage) msgs.push(pendingUserMessage);
      if (streamingMessage && streamingMessage.content.trim() !== '') {
        const tempMessage: Message = {
          id: 'streaming-temp',
          senderId: 'assistant',
          senderName: 'ChatGPT',
          content: streamingMessage.content,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isAI: true,
        };
        msgs.push(tempMessage);
      }
      return msgs;
    }

    if (data?.mapping && currentLeafId) {
      const thread = getThread(data.mapping, currentLeafId);

      if (pendingUserMessage && !thread.find(m => m.id === pendingUserMessage.id)) {
        thread.push(pendingUserMessage);
      }

      if (streamingMessage && streamingMessage.content.trim() !== '') {
        const tempMessage: Message = {
          id: 'streaming-temp',
          senderId: 'assistant',
          senderName: 'ChatGPT',
          content: streamingMessage.content,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isAI: true,
        };
        thread.push(tempMessage);
      }

      return thread;
    }

    return [];
  }, [data, currentLeafId, activeConversationId, pendingUserMessage, streamingMessage]);

  const handleVariantSwitch = useCallback((messageId: string, newVariantIndex: number) => {
    if (!data?.mapping) return;

    const currentNode = data.mapping[messageId];
    if (!currentNode) return;

    const role = currentNode.message?.author.role;
    let targetParentId = currentNode.parent;


    if (role === 'assistant') {
      let ptr = currentNode.parent;
      while (ptr && data.mapping[ptr]) {
        const node = data.mapping[ptr];
        if (node.message?.author.role === 'user') {
          targetParentId = ptr;
          break;
        }
        ptr = node.parent;
      }
    }

    if (!targetParentId || !data.mapping[targetParentId]) return;

    const parent = data.mapping[targetParentId];

    const targetSiblings = parent.children.filter(childId => {
      const childNode = data.mapping[childId];
      return childNode?.message?.author.role === role;
    });

    const newBranchRootId = targetSiblings[newVariantIndex - 1];
    if (!newBranchRootId) return;


    let ptr = newBranchRootId;
    while (data.mapping[ptr]?.children.length > 0) {
      const children = data.mapping[ptr].children;
      ptr = children[children.length - 1];
    }

    setCurrentLeafId(ptr);
  }, [data]);

  const hasMessages = messages.length > 0;

  const title = useMemo(() => {
    if (isLoading && !hasMessages && activeConversationId) return 'Loading...';
    if (!activeConversationId) return FALLBACK_CHAT_HEADER;
    return data?.title ?? FALLBACK_CHAT_HEADER;
  }, [isLoading, hasMessages, activeConversationId, data?.title]);

  const renderContent = () => {

    if (isLoading && !hasMessages && activeConversationId) {
      return (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground opacity-20" />
        </div>
      );
    }

    if (error && activeConversationId) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 text-muted-foreground">
          <AlertTriangle className="h-10 w-10 opacity-20" />
          <p>Failed to load conversation</p>
          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 px-4 py-2 rounded-md border border-white/10 hover:bg-white/5 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Retry
          </button>
        </div>
      );
    }

    if (!hasMessages) {
      return <EmptyChatState />;
    }

    return (
      <>
        <MessageList
          messages={messages}
          isStreaming={!!streamingMessage}
          onVariantSwitch={handleVariantSwitch}
        />
        <div ref={bottomRef} />
      </>
    );
  };

  return (
    <main className="flex flex-1 flex-col h-full min-w-0 glass-panel">
      <ChatHeader title={title} />

      <div className="flex-1 overflow-hidden relative flex flex-col">
        {renderContent()}
      </div>

      <MessageInput />
    </main>
  );
}
