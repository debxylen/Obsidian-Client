import { useRef, useEffect, useCallback, useMemo } from 'react';
import { MessageItem } from './MessageItem';
import { DateDivider } from './DateDivider';
import type { Message } from '@/data/mockData';
import { useVirtualizer } from '@tanstack/react-virtual';

interface MessageListProps {
  messages: Message[];
  isStreaming?: boolean;
  onVariantSwitch?: (messageId: string, newVariantIndex: number) => void;
}

type ListItem =
  | { type: 'message'; message: Message; index: number }
  | { type: 'divider'; date: string; id: string };

export function MessageList({ messages, isStreaming = false, onVariantSwitch }: MessageListProps) {
  const parentRef = useRef<HTMLDivElement>(null);
  const lastMessageContentRef = useRef<string>('');

  const listItems = useMemo(() => {
    const items: ListItem[] = [];
    let lastDate = '';

    messages.forEach((msg, idx) => {
      const msgDate = msg.fullDate || '';

      if (msgDate && msgDate !== lastDate) {
        items.push({
          type: 'divider',
          date: msgDate,
          id: `divider-${msgDate}-${idx}`
        });
        lastDate = msgDate;
      }

      items.push({
        type: 'message',
        message: msg,
        index: idx
      });
    });

    return items;
  }, [messages]);

  const count = listItems.length;
  const getScrollElement = useCallback(() => parentRef.current, []);

  const estimateSize = useCallback((index: number) => {
    const item = listItems[index];

    return item?.type === 'divider' ? 48 : 80;
  }, [listItems]);

  const rowVirtualizer = useVirtualizer({
    count,
    getScrollElement,
    estimateSize,
    overscan: 12,
  });

  useEffect(() => {
    if (count > 0) {
      rowVirtualizer.scrollToIndex(count - 1, {
        align: 'end',
        behavior: 'smooth',
      });
    }
  }, [count, rowVirtualizer]);

  useEffect(() => {
    if (isStreaming && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.content !== lastMessageContentRef.current) {
        lastMessageContentRef.current = lastMessage.content;
        rowVirtualizer.scrollToIndex(count - 1, {
          align: 'end',
          behavior: 'auto',
        });
      }
    }
  }, [messages, isStreaming, rowVirtualizer, count]);

  const virtualItems = rowVirtualizer.getVirtualItems();

  return (
    <div
      ref={parentRef}
      className="flex-1 overflow-y-auto scrollbar-thin scroll-smooth"
    >
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualItems.map((virtualRow) => {
          const item = listItems[virtualRow.index];
          if (!item) return null;

          if (item.type === 'divider') {
            return (
              <div
                key={item.id}
                ref={rowVirtualizer.measureElement}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                <DateDivider date={item.date} />
              </div>
            );
          }

          const msg = item.message;
          const prevItem = virtualRow.index > 0 ? listItems[virtualRow.index - 1] : null;

          const showHeader = !prevItem ||
            prevItem.type === 'divider' ||
            (prevItem.type === 'message' && prevItem.message.senderId !== msg.senderId);

          const isStreamingItem = isStreaming && item.index === messages.length - 1;

          return (
            <div
              key={msg.id}
              data-index={virtualRow.index}
              ref={rowVirtualizer.measureElement}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              <MessageItem
                message={msg}
                showHeader={showHeader}
                isStreaming={isStreamingItem}
                onVariantSwitch={onVariantSwitch}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
