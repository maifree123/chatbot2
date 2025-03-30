import { loadChat } from '@/db/index';
import ChatContainer from '@/components/ui/ChatContainer';
import UploadContainer from '@/components/UploadContainer';
import ThemeToggle from '@/components/ThemeToggle';
import AuthGuard from '@/components/AuthGuard';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';


export default async function Page({ params }: { params: { id?: string[] } }) {
  // 保持原有的参数解析方式
  const resolvedParams = await params;
  const id = resolvedParams.id?.[0];
  
  // 新增的请求头获取方式
  const headersList = await headers();  // 使用 next/headers 的 API
  const userId = Number(headersList.get('X-User-ID')); 

  const messages = id ? await loadChat(id, userId) : [];
    // 如果存在 ID 但加载不到消息（说明无权限）
    if (id && messages.length === 0) {
      redirect('/chat');
    }

  return (
    <AuthGuard>
    <div className="h-screen w-screen bg-background">
      <div className="flex h-full">
        <div className="border-border ">
          <UploadContainer />
        </div>

        <div className="w-full flex flex-col pb-4">
          <ChatContainer
            id={id}
            initialMessages={messages}
          />
        </div>
      </div>

      <div className="fixed bottom-4 right-4">
        <ThemeToggle />
      </div>
    </div>
    </AuthGuard>
  );
}