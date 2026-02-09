import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { Category } from '@/data/mockData';

interface CategoryGroupProps {
  category: Category;
  activeConversationId: string;
  onSelectConversation: (id: string) => void;
}

export function CategoryGroup({ category, activeConversationId, onSelectConversation }: CategoryGroupProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center gap-1 py-2 px-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground hover:text-foreground transition-colors duration-200"
      >
        <ChevronDown
          className={`h-3 w-3 shrink-0 transition-transform duration-200 ${isOpen ? '' : '-rotate-90'}`}
        />
        <span>{category.name}</span>
      </button>

      {isOpen && (
        <div className="space-y-[2px]">
          {category.conversations.map((conv) => {
            const isActive = activeConversationId === conv.id;
            return (
              <button
                key={conv.id}
                onClick={() => onSelectConversation(conv.id)}
                className={`sidebar-item flex w-full items-center px-3 py-[9px] text-[14.5px] truncate ${isActive
                    ? 'sidebar-item-active text-foreground'
                    : 'text-sidebar-foreground'
                  }`}
              >
                <span className="truncate">{conv.title}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
