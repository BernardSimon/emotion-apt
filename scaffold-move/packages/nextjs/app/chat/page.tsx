"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
// 替换原来的router导入方式
import "highlight.js/styles/github-dark.css";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";
import { ArrowPathIcon, PaperAirplaneIcon } from "@heroicons/react/24/outline";
import PolicyModal from "~~/components/emotion-apt/PolicyModal";
import { useGlobalState } from "~~/services/store/store";

const ChatPage = () => {
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [policyModalOpen, setPolicyModalOpen] = useState(false);
  const store = useGlobalState();

  useEffect(() => {
    if (!store.agreeAIPolicy) {
      setPolicyModalOpen(true);
    }
  }, [store.agreeAIPolicy]); // 添加依赖项

  const handleAgree = () => {
    store.setAgreeAIPolicy(true);
    setPolicyModalOpen(false);
  };
  // 示例消息数据
  type Message = {
    id: number;
    text: string;
    isAI: boolean;
  };
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hello！How can I help you today?",
      isAI: true,
    },
    { id: 2, text: "I feel like confused these days...", isAI: false },
  ]);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  const { account } = useWallet();
  if (!account?.address) {
    return (
      <>
        <div className="flex items-center flex-col flex-grow pt-10">
          <div className="px-5">
            <h1 className="text-center">
              <span className="block text-2xl mb-2">Emotion Apt</span>
              <span className="block text-4xl font-bold">Please Connect Your Wallet</span>
              <button
                className="btn btn-primary mt-10"
                onClick={() => {
                  router.push("/");
                }}
              >
                Back To Home
              </button>
            </h1>
          </div>
        </div>
      </>
    );
  }
  // @ts-ignore
  return (
    <div className="flex flex-col h-[calc(100vh-120px)] mx-auto p-4 w-full bg-base-200">
      <PolicyModal
        open={policyModalOpen}
        onAgree={handleAgree}
        onCancel={() => {
          router.push("/");
        }}
      />
      {/* 聊天头部 - 保持不变 */}
      <div className="flex items-center justify-between mb-6 p-4 bg-base-200 rounded-xl">
        <div className="flex items-center gap-2">
          <div className="avatar online"></div>
          <div>
            <h1 className="text-xl font-bold">AI Consultant</h1>
          </div>
        </div>
        <button
          className="btn btn-info btn-sm"
          onClick={() => {
            setMessages([
              {
                id: 1,
                text: "Hello！How can I help you today?",
                isAI: true,
              },
            ]);
          }}
        >
          <ArrowPathIcon className="h-4 w-4" />
          New Chat
        </button>
      </div>

      {/* 消息列表 - 添加Markdown支持 */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2">
        {messages.map(message => (
          <div key={message.id} className={`chat ${message.isAI ? "chat-start" : "chat-end"}`}>
            {message.isAI && <div className="chat-image"></div>}
            <div className={`chat-bubble ${message.isAI ? "chat-bubble-primary" : "chat-bubble-secondary"}`}>
              {message.isAI ? (
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeHighlight]}
                  components={{
                    a: ({ ...props }) => (
                      <a
                        {...props}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-secondary hover:underline"
                      />
                    ),
                    code: () => <code />,
                  }}
                  // 移除 className 属性，因为它不被 IntrinsicAttributes & Readonly<Options> 类型支持
                  // className="prose prose-sm max-w-full text-left"
                >
                  {message.text}
                </ReactMarkdown>
              ) : (
                message.text
              )}
            </div>
            <div className="chat-footer opacity-50 text-xs mt-1">{message.isAI ? "AI" : "Me"}</div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* 输入区域 - 保持不变 */}
      <div className="mt-4 p-4 bg-base-200 rounded-xl shadow-lg">
        <form className="flex gap-2">
          <input
            type="text"
            placeholder="Please enter your message..."
            className="input input-bordered flex-1 focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button className="btn btn-primary">
            <PaperAirplaneIcon className="h-5 w-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatPage;
