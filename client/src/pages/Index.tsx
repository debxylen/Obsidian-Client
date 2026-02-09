import { ConversationSidebar } from '@/components/chat/ConversationSidebar';
import { ChatArea } from '@/components/chat/ChatArea';
import { SessionTokenModal } from '@/components/chat/SessionTokenModal';
import { useSessionToken } from '@/hooks/useSessionToken';
import { useChatContext } from '@/context/ChatContext';

function IndexContent() {
  const { saveToken } = useSessionToken();
  const { activeConversationId, setActiveConversationId, showSessionModal } = useChatContext();

  return (
    <div className="flex h-full w-full">
      <SessionTokenModal open={showSessionModal} onSave={saveToken} />
      <ConversationSidebar
        activeConversationId={activeConversationId}
        onSelectConversation={setActiveConversationId}
      />
      <ChatArea
        key={activeConversationId || 'new-chat'}
        activeConversationId={activeConversationId}
      />
    </div>
  );
}

const Index = () => {
  return <IndexContent />;
};

export default Index;
