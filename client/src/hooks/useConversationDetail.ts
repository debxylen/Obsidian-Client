import { useQuery } from '@tanstack/react-query';
import { useSessionToken } from './useSessionToken';
import { Message } from '@/data/mockData';
import { getConvincingHeaders } from '@/utils/api-headers';

export interface APIMessage {
    id: string;
    author: {
        role: string;
        name: string | null;
        metadata: any;
    };
    content: {
        content_type: string;
        parts?: string[];
        text?: string;
    };
    create_time: number | null;
    update_time: number | null;
    status: string;
    end_turn: boolean | null;
    weight: number;
    metadata: {
        is_visually_hidden_from_conversation?: boolean;
        [key: string]: any;
    };
    recipient: string;
}

export interface ConversationDetailResponse {
    title: string;
    mapping: Record<string, {
        id: string;
        message: APIMessage | null;
        parent: string | null;
        children: string[];
    }>;
    current_node: string;
    conversation_id: string;
}

export function getThread(
    mapping: ConversationDetailResponse['mapping'],
    leafId: string
): Message[] {
    const messages: Message[] = [];
    let currentId = leafId;

    while (currentId && mapping[currentId]) {
        const node = mapping[currentId];
        const msg = node.message;

        if (msg && !msg.metadata?.is_visually_hidden_from_conversation &&
            (msg.author.role === 'user' || msg.author.role === 'assistant')) {

            let content = '';
            if (msg.content.parts) {
                content = msg.content.parts.filter(p => typeof p === 'string').join('\n');
            } else if (msg.content.text) {
                content = msg.content.text;
            }

            if (content.trim()) {
                const date = msg.create_time ? new Date(msg.create_time * 1000) : new Date();

                let variantInfo = undefined;
                const parentId = node.parent;

                if (msg.author.role === 'user') {

                    if (parentId && mapping[parentId]) {
                        const parent = mapping[parentId];
                        const siblings = parent.children;

                        const userSiblings = siblings.filter(sibId => {
                            const sib = mapping[sibId]?.message;
                            return sib?.author.role === 'user';
                        });

                        if (userSiblings.length > 1) {
                            const index = userSiblings.indexOf(node.id);
                            variantInfo = {
                                current: index + 1,
                                total: userSiblings.length,
                                hasVariants: true,
                                parentId: parentId
                            };
                        }
                    }
                } else if (msg.author.role === 'assistant') {




                    let branchRootId = node.id;
                    let ptr = node.parent;
                    let turnRootId = null;

                    while (ptr && mapping[ptr]) {
                        const parentNode = mapping[ptr];
                        if (parentNode.message?.author.role === 'user') {
                            turnRootId = ptr;
                            break;
                        }

                        branchRootId = ptr;
                        ptr = parentNode.parent;
                    }

                    if (turnRootId && mapping[turnRootId]) {
                        const turnRoot = mapping[turnRootId];
                        const siblings = turnRoot.children;

                        const assistantBranches = siblings.filter(sibId => {
                            const sib = mapping[sibId]?.message;


                            return sib?.author.role === 'assistant';
                        });

                        if (assistantBranches.length > 1) {
                            const index = assistantBranches.indexOf(branchRootId);
                            if (index !== -1) {
                                variantInfo = {
                                    current: index + 1,
                                    total: assistantBranches.length,
                                    hasVariants: true,
                                    parentId: turnRootId
                                };
                            }
                        }
                    }
                }

                messages.push({
                    id: msg.id,
                    senderId: msg.author.role,
                    senderName: msg.author.role === 'user' ? 'You' : (msg.author.name || 'ChatGPT'),
                    content: content,
                    timestamp: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    fullDate: date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
                    isAI: msg.author.role === 'assistant',
                    variantInfo
                });
            }
        }
        currentId = node.parent || '';
    }

    return messages.reverse();
}

function parseConversation(data: ConversationDetailResponse): Message[] {
    return getThread(data.mapping, data.current_node);
}

export function useConversationDetail(conversationId: string | null) {
    const { token, cookieString, baseUrl } = useSessionToken();

    return useQuery({
        queryKey: ['conversation', conversationId, token, cookieString, baseUrl],
        queryFn: async () => {
            if (!token) throw new Error('No session token');
            if (!conversationId) return null;

            const url = `${baseUrl}/proxy/https://chatgpt.com/backend-api/conversation/${conversationId}`;

            const response = await fetch(url, {
                headers: getConvincingHeaders(token, cookieString || undefined),
            });

            if (!response.ok) {
                throw new Error('Failed to fetch conversation detail');
            }

            const data: ConversationDetailResponse = await response.json();
            return {
                ...data,
                parsedMessages: parseConversation(data)
            };
        },
        enabled: !!token && !!conversationId,
        staleTime: 30000,

        placeholderData: undefined,
    });
}
