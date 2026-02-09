import { useState, useCallback, useRef } from 'react';
import { useSessionToken } from './useSessionToken';
import { useQueryClient } from '@tanstack/react-query';
import { getConvincingHeaders } from '@/utils/api-headers';

export interface SendMessageParams {
    conversationId: string;
    parentMessageId: string;
    content: string;
    messageId?: string;
}

export interface StreamingMessage {
    id: string;
    content: string;
    isComplete: boolean;
}

export function useSendMessage() {
    const { token, cookieString, baseUrl } = useSessionToken();
    const queryClient = useQueryClient();
    const [isStreaming, setIsStreaming] = useState(false);
    const [streamingMessage, setStreamingMessage] = useState<StreamingMessage | null>(null);
    const [error, setError] = useState<string | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    const sendMessage = useCallback(async ({
        conversationId,
        parentMessageId,
        content,
        messageId,
    }: SendMessageParams): Promise<{ newParentId: string, conversationId: string } | null> => {
        if (!token) {
            setError('No session token');
            return null;
        }

        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();

        setIsStreaming(true);
        setError(null);
        setStreamingMessage(null);

        let assistantMessageId = '';
        let accumulatedContent = '';
        let currentConversationId = conversationId;

        try {
            const url = `${baseUrl}/chat`;

            const requestBody: any = {
                token: token,
                message: content,
                message_id: messageId,
                cookies: cookieString,
            };


            if (conversationId && conversationId.trim() !== '') {
                requestBody.conv_id = conversationId;
                requestBody.parent_id = parentMessageId;
            }

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    ...getConvincingHeaders(token, cookieString || undefined, false),
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
                signal: abortControllerRef.current.signal,
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || `HTTP error! status: ${response.status}`);
            }

            const reader = response.body?.getReader();
            if (!reader) {
                throw new Error('No reader available');
            }

            const decoder = new TextDecoder();
            let buffer = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                buffer += chunk;
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';

                for (const line of lines) {
                    const trimmedLine = line.trim();
                    if (!trimmedLine || !trimmedLine.startsWith('data:')) continue;

                    const dataStr = trimmedLine.slice(5).trim();
                    if (dataStr === '[DONE]') {
                        setStreamingMessage(prev => prev ? { ...prev, isComplete: true } : null);
                        break;
                    }

                    try {
                        const data = JSON.parse(dataStr);



                        if (data.conversation_id) {
                            currentConversationId = data.conversation_id;
                        }

                        if (data.p !== undefined && (data.o === 'add' || data.o === 'append' || data.o === 'patch')) {
                            if (data.o === 'add' && data.v?.message) {

                                if (data.v.message.author?.role !== 'assistant') {
                                    continue;
                                }

                                assistantMessageId = data.v.message.id;
                                if (data.v.conversation_id) currentConversationId = data.v.conversation_id;
                                accumulatedContent = data.v.message.content?.parts?.[0] || '';
                                setStreamingMessage({
                                    id: assistantMessageId,
                                    content: accumulatedContent,
                                    isComplete: false,
                                });
                            } else if (data.o === 'append' && data.p?.includes('/content/parts/0')) {

                                if (!assistantMessageId) continue;

                                accumulatedContent += data.v;
                                setStreamingMessage(prev => ({
                                    id: assistantMessageId || prev?.id || '',
                                    content: accumulatedContent,
                                    isComplete: false,
                                }));
                            } else if (data.o === 'patch' || (data.o === 'append' && !data.p?.includes('/content'))) {
                                if (data.v && typeof data.v === 'string' && assistantMessageId) {
                                    accumulatedContent += data.v;
                                    setStreamingMessage(prev => ({
                                        id: assistantMessageId || prev?.id || '',
                                        content: accumulatedContent,
                                        isComplete: false,
                                    }));
                                }
                            }
                        }

                        if (data.message?.content?.parts?.[0] && data.message.author?.role === 'assistant') {
                            assistantMessageId = data.message.id;
                            accumulatedContent = data.message.content.parts[0];
                            setStreamingMessage({
                                id: assistantMessageId,
                                content: accumulatedContent,
                                isComplete: false,
                            });
                        }

                        if (data.type === 'message_stream_complete' || data.is_complete) {
                            setStreamingMessage(prev => prev ? { ...prev, isComplete: true } : null);
                        }

                    } catch (e) {

                    }
                }
            }

            if (currentConversationId) {
                queryClient.invalidateQueries({ queryKey: ['conversation', currentConversationId] });
                queryClient.invalidateQueries({ queryKey: ['conversations'] });
            }

            setIsStreaming(false);
            return {
                newParentId: assistantMessageId || parentMessageId,
                conversationId: currentConversationId
            };
        } catch (err) {
            if ((err as Error).name === 'AbortError') {
                setIsStreaming(false);
                return null;
            }
            setError((err as Error).message);
            setIsStreaming(false);
            return null;
        }
    }, [token, queryClient, baseUrl]);

    const abortStream = useCallback(() => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
        }
        setIsStreaming(false);
        setStreamingMessage(null);
    }, []);

    const clearState = useCallback(() => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
        }
        setIsStreaming(false);
        setStreamingMessage(null);
        setError(null);
    }, []);

    return {
        sendMessage,
        abortStream,
        clearState,
        isStreaming,
        streamingMessage,
        error,
    };
}
