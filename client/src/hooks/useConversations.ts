import { useQuery } from '@tanstack/react-query';
import { useSessionToken } from './useSessionToken';
import { Category, Conversation } from '@/data/mockData';
import { format, isToday, isYesterday, isAfter, subDays, startOfDay } from 'date-fns';
import { getConvincingHeaders } from '@/utils/api-headers';

export interface APIConversation {
    id: string;
    title: string;
    create_time: string;
    update_time: string;
    mapping: any;
    current_node: any;
    conversation_template_id: any;
    gizmo_id: any;
    is_archived: boolean;
    is_starred: boolean | null;
    is_do_not_remember: boolean | null;
    memory_scope: string;
    context_scopes: any;
    workspace_id: any;
    async_status: any;
}

export interface ConversationResponse {
    items: APIConversation[];
    total: number;
    limit: number;
    offset: number;
}

function groupConversations(apiItems: APIConversation[]): Category[] {
    const categories: Record<string, Category> = {
        today: { id: 'today', name: 'Today', conversations: [] },
        yesterday: { id: 'yesterday', name: 'Yesterday', conversations: [] },
        last7: { id: 'last7', name: 'Previous 7 Days', conversations: [] },
        last30: { id: 'last30', name: 'Previous 30 Days', conversations: [] },
        older: { id: 'older', name: 'Earlier', conversations: [] },
    };

    const today = startOfDay(new Date());
    const yesterday = startOfDay(subDays(today, 1));
    const sevenDaysAgo = startOfDay(subDays(today, 7));
    const thirtyDaysAgo = startOfDay(subDays(today, 30));

    apiItems.forEach((item) => {
        const updateDate = new Date(item.update_time);
        const conv: Conversation = {
            id: item.id,
            title: item.title,
            lastMessage: '',
            timestamp: format(updateDate, 'MMM d'),
        };

        if (isToday(updateDate)) {
            categories.today.conversations.push(conv);
        } else if (isYesterday(updateDate)) {
            categories.yesterday.conversations.push(conv);
        } else if (isAfter(updateDate, sevenDaysAgo)) {
            categories.last7.conversations.push(conv);
        } else if (isAfter(updateDate, thirtyDaysAgo)) {
            categories.last30.conversations.push(conv);
        } else {
            categories.older.conversations.push(conv);
        }
    });

    return Object.values(categories).filter(cat => cat.conversations.length > 0);
}

export function useConversations() {
    const { token, cookieString, baseUrl } = useSessionToken();

    return useQuery({
        queryKey: ['conversations', token, cookieString, baseUrl],
        queryFn: async () => {
            if (!token) throw new Error('No session token');

            const url = `${baseUrl}/proxy/https://chatgpt.com/backend-api/conversations?offset=0&limit=20&order=updated&is_archived=false&is_starred=false`;

            const response = await fetch(url, {
                headers: getConvincingHeaders(token, cookieString || undefined),
            });

            if (!response.ok) {
                throw new Error('Failed to fetch conversations');
            }

            const data: ConversationResponse = await response.json();
            return {
                ...data,
                groupedCategories: groupConversations(data.items)
            };
        },
        enabled: !!token,
        staleTime: 60000,
    });
}
