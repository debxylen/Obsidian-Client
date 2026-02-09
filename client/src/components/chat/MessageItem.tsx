import React, { useRef, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { Message } from '@/data/mockData';
import { useUserInfo } from '@/hooks/useUserInfo';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface MessageItemProps {
  message: Message;
  showHeader?: boolean;
  isStreaming?: boolean;
  onVariantSwitch?: (messageId: string, newVariantIndex: number) => void;
}

export const MessageItem = React.memo(function MessageItem({
  message,
  showHeader = true,
  isStreaming = false,
  onVariantSwitch,
}: MessageItemProps) {
  const { senderName, content, timestamp, isAI, variantInfo } = message;
  const { data: user } = useUserInfo();

  const avatarUrl = isAI
    ? '/chatgpt.png'
    : (user?.picture);

  const renderVariantSwitcher = () => {
    if (!variantInfo || variantInfo.total <= 1) {
      return null;
    }

    const { current, total } = variantInfo;

    const handleSwitchVariant = (direction: 'prev' | 'next') => {
      if (onVariantSwitch) {
        let newIndex = current;
        if (direction === 'prev') {
          newIndex = current - 1;
          if (newIndex < 1) newIndex = total;
        } else {
          newIndex = current + 1;
          if (newIndex > total) newIndex = 1;
        }
        onVariantSwitch(message.id, newIndex);
      }
    };

    return (
      <div className="flex items-center gap-0.5 text-muted-foreground select-none">
        <button
          onClick={() => handleSwitchVariant('prev')}
          className="p-0.5 rounded hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors"
          title="Previous variant"
        >
          <ChevronLeft className="h-3 w-3" />
        </button>
        <span className="text-[10px] font-medium mx-1 min-w-[20px] text-center">
          {current} / {total}
        </span>
        <button
          onClick={() => handleSwitchVariant('next')}
          className="p-0.5 rounded hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors"
          title="Next variant"
        >
          <ChevronRight className="h-3 w-3" />
        </button>
      </div>
    );
  };

  return (
    <div className="message-hover group" data-message-id={message.id}>
      <div className={`mx-auto max-w-7xl flex gap-4 px-4 py-0.5 ${showHeader ? 'mt-[17px]' : ''}`}>
        {showHeader ? (
          <Avatar className="h-10 w-10 mt-0.5 shrink-0">
            {avatarUrl && <AvatarImage src={avatarUrl} className="object-cover" />}
            <AvatarFallback
              className={`text-xs font-medium ${isAI
                ? 'bg-chat-ai-avatar text-chat-ai-name font-bold'
                : 'bg-chat-user-avatar text-chat-user-name'
                }`}
            >
              {isAI ? 'AI' : (senderName?.[0] || 'U')}
            </AvatarFallback>
          </Avatar>
        ) : (
          <div className="w-10 shrink-0" />
        )}

        <div className="min-w-0 flex-1">
          {showHeader && (
            <div className="flex items-center gap-2 mb-0.5 h-6">
              <span
                className={`font-semibold text-[15px] leading-snug ${isAI ? 'text-chat-ai-name' : 'text-chat-user-name'
                  }`}
              >
                {senderName}
              </span>
              <span className="text-xs text-muted-foreground opacity-50">{timestamp}</span>
              {renderVariantSwitcher()}
            </div>
          )}
          <div className={`markdown-content prose prose-invert max-w-none text-[15px] leading-[1.375rem] text-foreground font-normal break-words ${isAI ? 'prose-ai' : ''}`}>
            {content ? (
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code({ node, inline, className, children, ...props }: any) {
                    const match = /language-(\w+)/.exec(className || '');
                    return !inline && match ? (
                      <SyntaxHighlighter
                        style={atomDark}
                        language={match[1]}
                        PreTag="div"
                        customStyle={{
                          margin: 0,
                          padding: '1.25rem',
                          background: 'transparent',
                          fontSize: '14px',
                          lineHeight: '1.5',
                        }}
                        {...props}
                      >
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    ) : (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    );
                  },
                }}
              >
                {content}
              </ReactMarkdown>
            ) : isStreaming ? (
              <span className="inline-flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '300ms' }} />
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
});
