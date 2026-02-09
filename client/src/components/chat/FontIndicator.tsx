import { memo } from 'react';

interface FontIndicatorProps {
  fontName: string;
}

export const FontIndicator = memo(function FontIndicator({ fontName }: FontIndicatorProps) {
  return (
    <div className="fixed bottom-2 right-2 px-3 py-1.5 rounded-lg text-xs text-muted-foreground glass-input opacity-60 pointer-events-none z-50 select-none">
      Font: {fontName} <span className="opacity-50 ml-1">Ctrl+Shift+F</span>
    </div>
  );
});
