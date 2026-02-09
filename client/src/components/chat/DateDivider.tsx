import React from 'react';

interface DateDividerProps {
    date: string;
}

export function DateDivider({ date }: DateDividerProps) {
    return (
        <div className="flex items-center gap-4 px-4 my-6 select-none pointer-events-none">
            <div className="h-px flex-1 bg-white/5" />
            <span className="text-[12px] font-bold text-muted-foreground opacity-70 whitespace-nowrap">
                {date}
            </span>
            <div className="h-px flex-1 bg-white/5" />
        </div>
    );
}
