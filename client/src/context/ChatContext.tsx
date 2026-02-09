import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSendMessage, StreamingMessage } from '@/hooks/useSendMessage';
import { useSessionToken } from '@/hooks/useSessionToken';
import { Message } from '@/data/mockData';

function generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

interface ChatContextType {

    activeConversationId: string;
    setActiveConversationId: (id: string) => void;

    currentParentMessageId: string;
    setCurrentParentMessageId: (id: string) => void;

    isStreaming: boolean;
    streamingMessage: StreamingMessage | null;
    error: string | null;

    pendingUserMessage: Message | null;

    sendMessage: (content: string) => Promise<void>;
    abortStream: () => void;

    inputValue: string;
    setInputValue: (value: string) => void;

    showSessionModal: boolean;
    setShowSessionModal: (show: boolean) => void;
}

const ChatContext = createContext<ChatContextType | null>(null);

export function ChatProvider({ children }: { children: React.ReactNode }) {
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const { token, showModal, setShowModal } = useSessionToken();

    const getUrlId = (path: string) => {
        const match = path.match(/^\/c\/([^\/]+)/);
        return match ? match[1] : '';
    };

    const urlId = getUrlId(pathname);

    const [activeConversationId, setActiveConversationIdState] = useState(urlId);
    const [currentParentMessageId, setCurrentParentMessageId] = useState('');
    const [pendingUserMessage, setPendingUserMessage] = useState<Message | null>(null);
    const [inputValue, setInputValue] = useState('');
    const lastKnownParentRef = useRef<string>('');

    const {
        sendMessage: sendMessageHook,
        abortStream,
        clearState,
        isStreaming,
        streamingMessage,
        error,
    } = useSendMessage();

    useEffect(() => {
        const idFromUrl = getUrlId(pathname);
        if (idFromUrl !== activeConversationId) {
            setActiveConversationIdState(idFromUrl);
            clearState();
            setPendingUserMessage(null);
            setCurrentParentMessageId('');
            setInputValue('');
            lastKnownParentRef.current = '';
        }
    }, [pathname, activeConversationId, clearState]);

    const updateParentMessageId = useCallback((id: string) => {
        setCurrentParentMessageId(id);
        lastKnownParentRef.current = id;
    }, []);

    const setActiveConversationId = useCallback((id: string) => {
        if (id) {
            navigate(`/c/${id}`);
        } else {
            navigate('/');
        }

    }, [navigate]);

    const sendMessage = useCallback(async (content: string) => {
        const isNewChat = !activeConversationId || activeConversationId === '';
        const parentId = isNewChat ? '' : (currentParentMessageId || lastKnownParentRef.current);

        const userMessageId = generateUUID();
        const userMessage: Message = {
            id: userMessageId,
            senderId: 'user',
            senderName: 'You',
            content: content,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isAI: false,
        };
        setPendingUserMessage(userMessage);

        const result = await sendMessageHook({
            conversationId: activeConversationId,
            parentMessageId: parentId,
            content,
            messageId: userMessageId,
        });

        if (result) {
            if (result.conversationId && result.conversationId !== activeConversationId) {

                navigate(`/c/${result.conversationId}`, { replace: true });
                setActiveConversationIdState(result.conversationId);
            }
            if (result.newParentId) {
                updateParentMessageId(result.newParentId);
            }
        }
    }, [activeConversationId, currentParentMessageId, sendMessageHook, updateParentMessageId, navigate]);

    const value: ChatContextType = {
        activeConversationId,
        setActiveConversationId,
        currentParentMessageId,
        setCurrentParentMessageId: updateParentMessageId,
        isStreaming,
        streamingMessage,
        error,
        pendingUserMessage,
        sendMessage,
        abortStream,
        inputValue,
        setInputValue,
        showSessionModal: showModal,
        setShowSessionModal: setShowModal,
    };

    return (
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    );
}

export function useChatContext() {
    const context = useContext(ChatContext);
    if (!context) {
        throw new Error('useChatContext must be used within a ChatProvider');
    }
    return context;
}
