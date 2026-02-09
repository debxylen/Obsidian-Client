import { Pin, Search, Bell, Users, HelpCircle } from 'lucide-react';
interface ChatHeaderProps {
  title: string;
}

const headerIcons = [Pin, Bell, Users, Search, HelpCircle];

export function ChatHeader({ title }: ChatHeaderProps) {
  return (
    <header className="flex items-center justify-between h-12 px-4 border-b glass-border glass-header shrink-0">
      <div className="flex items-center gap-2 min-w-0">
        <h1 className="text-base text-foreground truncate">{title}</h1>
      </div>
      <div className="flex items-center gap-3.5 shrink-0">
        {headerIcons.map((Icon, i) => (
          <button
            key={i}
            className="header-icon text-muted-foreground hover:text-foreground"
          >
            <Icon className="h-5 w-5" />
          </button>
        ))}
      </div>
    </header>
  );
}
