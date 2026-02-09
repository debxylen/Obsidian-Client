import { Search, Bot, Image, AppWindow, MessageSquareDashed, Plus, Loader2 } from 'lucide-react';
import { CategoryGroup } from './CategoryGroup';
import { useConversations } from '@/hooks/useConversations';
import { UserInfo } from './UserInfo';

interface ConversationSidebarProps {
  activeConversationId: string;
  onSelectConversation: (id: string) => void;
}

const aiTools = [
  { icon: MessageSquareDashed, label: 'Search Chats' },
  { icon: Bot, label: 'GPTs / Models' },
  { icon: Image, label: 'Images' },
  { icon: AppWindow, label: 'Apps' },
];

export function ConversationSidebar({ activeConversationId, onSelectConversation }: ConversationSidebarProps) {
  const { data, isLoading, error } = useConversations();

  return (
    <aside className="glass-sidebar w-[340px] shrink-0 flex flex-col h-full border-r glass-border">
      <div className="p-3 pb-2.5">
        <button className="flex w-full items-center gap-2.5 rounded-md glass-search px-3 py-[7px] text-sm text-muted-foreground cursor-text">
          <Search className="h-4 w-4 shrink-0 opacity-50" />
          <span className="text-[13px] font-normal opacity-60">Find or start a conversation</span>
        </button>
      </div>

      <div className="px-2.5 space-y-0.5">
        {aiTools.map((tool) => (
          <button
            key={tool.label}
            className="sidebar-tool flex w-full items-center gap-3.5 px-3 py-[9px] text-[15px] font-normal text-sidebar-foreground"
          >
            <tool.icon className="h-5 w-5 opacity-60" />
            <span>{tool.label}</span>
          </button>
        ))}
      </div>

      <div className="mx-3 my-3 h-px glass-separator" />

      <div className="flex-1 overflow-y-auto scrollbar-thin px-2.5 pb-3">
        <button
          onClick={() => onSelectConversation('')}
          className="sidebar-tool flex w-full items-center gap-2.5 px-3 py-[9px] text-sm font-normal text-sidebar-foreground mb-1.5"
        >
          <Plus className="h-4 w-4 opacity-60" />
          <span>New Chat</span>
        </button>

        <div className="space-y-1.5">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground opacity-50" />
            </div>
          ) : error ? (
            <div className="px-3 py-4 text-xs text-red-400/70 text-center">
              Failed to load conversations
            </div>
          ) : data?.groupedCategories.map((category) => (
            <CategoryGroup
              key={category.id}
              category={category}
              activeConversationId={activeConversationId}
              onSelectConversation={onSelectConversation}
            />
          ))}
          {!isLoading && !error && data?.items.length === 0 && (
            <div className="px-3 py-8 text-xs text-muted-foreground text-center opacity-50">
              No conversations yet
            </div>
          )}
        </div>
      </div>

      <UserInfo />
    </aside>
  );
}
