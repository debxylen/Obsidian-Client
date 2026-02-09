import { useRef, useCallback, useState, useEffect } from 'react';
import { Plus, Smile, Paperclip, Send, Square } from 'lucide-react';
import { useChatContext } from '@/context/ChatContext';

export function MessageInput() {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const {
    sendMessage,
    isStreaming,
    abortStream,
    activeConversationId,
    inputValue,
    setInputValue
  } = useChatContext();

  const handleInput = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 200) + 'px';
  }, []);

  useEffect(() => {
    handleInput();
  }, [inputValue, handleInput]);

  const handleSend = useCallback(async () => {
    const content = inputValue.trim();
    if (!content || isStreaming) return;

    setInputValue('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    await sendMessage(content);
  }, [inputValue, isStreaming, activeConversationId, sendMessage]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
  }, []);

  const canSend = inputValue.trim().length > 0 && !isStreaming;

  useEffect(() => {
    if (!isStreaming) {
      textareaRef.current?.focus();
    }
  }, [isStreaming]);

  return (
    <div className="px-4 pb-6 pt-2 shrink-0">
      <div className={`h-6 flex items-center gap-2 px-2 pb-1 transition-opacity duration-300 ${isStreaming ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="flex gap-1 items-center">
          <span className="w-1 h-1 rounded-full bg-muted-foreground/50 typing-dot" />
          <span className="w-1 h-1 rounded-full bg-muted-foreground/50 typing-dot" />
          <span className="w-1 h-1 rounded-full bg-muted-foreground/50 typing-dot" />
        </div>
        <span className="text-[12.5px] font-medium text-muted-foreground/60">
          ChatGPT is thinking...
        </span>
      </div>

      <div className="flex items-end gap-3 glass-input rounded-xl px-4 py-3">
        <button className="text-muted-foreground hover:text-foreground transition-colors duration-200 pb-0.5">
          <Plus className="h-5 w-5" />
        </button>

        <textarea
          ref={textareaRef}
          value={inputValue}
          onChange={handleChange}
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          placeholder="Message ChatGPT"
          rows={1}
          autoFocus
          disabled={isStreaming}
          className="flex-1 bg-transparent text-[15px] text-foreground placeholder:text-muted-foreground resize-none outline-none leading-[1.45rem] max-h-[200px] scrollbar-thin disabled:opacity-50 disabled:cursor-not-allowed"
        />

        <div className="flex items-center gap-3 pb-0.5">
          <button className="text-muted-foreground hover:text-foreground transition-colors duration-200">
            <Paperclip className="h-5 w-5" />
          </button>
          <button className="text-muted-foreground hover:text-foreground transition-colors duration-200">
            <Smile className="h-5 w-5" />
          </button>

          {isStreaming ? (
            <button
              onClick={abortStream}
              className="text-red-400 hover:text-red-300 transition-colors duration-200"
              title="Stop generating"
            >
              <Square className="h-5 w-5 fill-current" />
            </button>
          ) : (
            <button
              onClick={handleSend}
              disabled={!canSend}
              className={`transition-colors duration-200 ${canSend
                ? 'text-primary hover:text-primary/80'
                : 'text-muted-foreground/40 cursor-not-allowed'
                }`}
            >
              <Send className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
