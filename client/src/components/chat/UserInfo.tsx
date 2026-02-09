import { Settings } from 'lucide-react';
import { useUserInfo } from '@/hooks/useUserInfo';
import { useChatContext } from '@/context/ChatContext';

export function UserInfo() {
    const { data: user, isLoading } = useUserInfo();
    const { setShowSessionModal } = useChatContext();

    const name = user?.name || 'Xylen';
    const picture = user?.picture || 'placeholder.svg';
    const tagline = user?.email || '*burp*';

    return (
        <div className="mt-auto p-3">
            <div className="flex items-center justify-between rounded-xl bg-gradient-to-r from-[#111224] via-[#1a1c3d] to-[#141529] p-2 pr-3 group hover:ring-1 hover:ring-white/10 transition-all duration-300 cursor-pointer border border-white/5 shadow-xl">
                <div className="flex items-center gap-3">
                    <div className="relative group/avatar">
                        <div className={`h-9 w-9 rounded-full ring-2 ring-white/5 overflow-hidden flex items-center justify-center bg-[#2d2f5e] relative z-10 ${isLoading ? 'animate-pulse' : ''}`}>
                            <img
                                src={picture}
                                alt="Avatar"
                                className="h-full w-full object-cover"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = 'placeholder.svg';
                                }}
                            />
                        </div>
                        <div className="absolute inset-0 rounded-full bg-blue-500/20 blur-md opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-500" />

                        <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-[#111224] bg-amber-500 z-20" title="Idle" />
                    </div>

                    <div className="flex flex-col -space-y-0.5">
                        <span className={`text-base font-semibold text-white tracking-tight group-hover:text-blue-200 transition-colors ${isLoading ? 'opacity-50' : ''}`}>
                            {isLoading ? 'Loading...' : name}
                        </span>
                        <span className="text-xs text-zinc-400 font-medium opacity-80">{tagline}</span>
                    </div>
                </div>

                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setShowSessionModal(true);
                    }}
                    className="text-white/40 hover:text-white transition-all duration-200 p-1.5 rounded-lg hover:bg-white/5 active:scale-95"
                >
                    <Settings className="h-4.5 w-4.5 stroke-[2.5]" />
                </button>
            </div>
        </div>
    );
}
