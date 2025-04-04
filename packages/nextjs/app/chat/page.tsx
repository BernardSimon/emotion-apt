"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getToken, setToken } from "../../../go/utils/axios/axios";
import { nowInSeconds } from "@aptos-labs/ts-sdk";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
// 替换原来的router导入方式
import "highlight.js/styles/github-dark.css";
import { toast } from "react-hot-toast";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";
import { ArrowPathIcon, PaperAirplaneIcon } from "@heroicons/react/24/outline";
import PolicyModal from "~~/components/emotion-apt/PolicyModal";
import useSignMessage from "~~/hooks/scaffold-move/useSignMessage";
import useSubmitTransaction from "~~/hooks/scaffold-move/useSubmitTransaction";
import { ChatApi } from "~~/restful/chat";
import { LoginApi } from "~~/restful/login";
import { useGlobalState, useUserInfo } from "~~/services/store/store";
import { ChatMessage, KeyWords } from "~~/types/emotion-apt/chat";
import { LoginRequest } from "~~/types/emotion-apt/login";
import { encryptWithEmbeddedSalt } from "~~/utils/emotion-apt/encrypt";

const ChatPage = () => {
  const router = useRouter();
  const SaveRecordsID = useRef(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [policyModalOpen, setPolicyModalOpen] = useState(false);
  const store = useGlobalState();
  const signMessage = useSignMessage();
  const [chattingDisabled, setChattingDisabled] = useState(false);
  const { submitTransaction, transactionResponse } = useSubmitTransaction("records");
  const userInfo = useUserInfo();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 0,
      text: "Hello！How can I help you today?",
      role: "A",
      visible: true,
    },
  ]);
  // useEffect(() => {
  //   if (!store.agreeAIPolicy) {
  //     setPolicyModalOpen(true);
  //   }
  // }, [store.agreeAIPolicy]); // 添加依赖项

  const handleAgree = () => {
    store.setAgreeAIPolicy(true);
    setPolicyModalOpen(false);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (transactionResponse?.transactionSubmitted) {
      if (transactionResponse.success) {
        toast.success("Save your Records Information Successful");
        const messagesRecords = messages;
        for (let i = 0; i < messagesRecords.length; i++) {
          if (messagesRecords[i].id == SaveRecordsID.current) {
            messagesRecords[i].visible = false;
          }
        }
        setMessages([...messagesRecords]);
      } else {
        toast.error("Save your Account Information Failed");
      }
    }
  }, [transactionResponse]);
  const { account } = useWallet();
  useEffect(() => {
    if (account?.address) {
      if (getToken() == "") {
        refreshToken();
      }
    }
  }, [account?.address]);
  const [typingMessage, setTypingMessage] = useState("");
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
  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (typingMessage.trim() === "" || chattingDisabled) return;

    setChattingDisabled(true);
    const userMessageId = messages[messages.length - 1]?.id + 1 || 1;
    const currentMessages = [...messages].filter(msg => msg.role !== "L" && msg.role !== "K");

    const profileString = JSON.stringify(userInfo);
    // 使用函数式更新确保状态一致性
    setMessages(prev => [
      ...prev,
      {
        id: userMessageId,
        text: typingMessage,
        role: "U",
        visible: true,
      },
      {
        id: userMessageId + 1,
        text: "Loading...",
        role: "L",
        visible: true,
      },
    ]);

    setTypingMessage("");

    // 获取最新的消息快照
    ChatApi({
      profile: profileString,
      chats: [
        ...currentMessages,
        {
          id: 0,
          text: typingMessage,
          role: "U",
          visible: true,
        },
      ],
    })
      .then(res => {
        setMessages(prev => {
          // 过滤掉临时的 loading 消息
          const filtered = prev.filter(msg => msg.role == "U" || msg.role == "A");
          let newMessage = [];
          if (res.keywords == null) {
            newMessage = [
              {
                id: filtered[filtered.length - 1].id + 1,
                text: res.message,
                role: "A",
                visible: true,
              },
            ];
          } else {
            newMessage = [
              {
                id: filtered[filtered.length - 1].id + 1,
                text: res.message,
                role: "A",
                visible: true,
              },
              {
                id: filtered[filtered.length - 1].id + 2,
                text: res.keywords,
                role: "K",
                visible: true,
              },
            ];
          }
          console.log(newMessage);
          return [...filtered, ...newMessage];
        });
        setChattingDisabled(false);
      })
      .catch(error => {
        console.error(error);
        setChattingDisabled(false);
      });
  };

  const handleKeywordsUpdate = async (id: number, keywords: string, description: string) => {
    const password = store.password;
    SaveRecordsID.current = id;
    const setKeyWords = await encryptWithEmbeddedSalt(password, keywords);
    const setDescription = await encryptWithEmbeddedSalt(password, description);
    // @ts-ignore
    try {
      await submitTransaction("add_record", [setKeyWords, setDescription]);
    } catch (e) {
      console.log(e);
    }
  };
  const refreshToken = () => {
    const signText = nowInSeconds().toString();

    signMessage(signText)
      .then(s => {
        console.log(s.fullMessage);
        const sign = s.signature.toString();
        console.log(sign);
        const salt = s.nonce;
        const params: LoginRequest = {
          address: account.address.toString(),
          sign,
          timestamp: signText,
          salt: salt.toString(),
          full_msg: account.publicKey.toString(),
        };
        LoginApi(params)
          .then(res => {
            setToken(res.token);
          })
          .catch(e => {
            console.log(e);
          });
      })
      .catch(e => {
        console.log(e);
      });
  };
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
                role: "A",
                visible: true,
              },
            ]);
          }}
        >
          <ArrowPathIcon className="h-4 w-4" />
          New Chat
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pr-2">
        {messages.map(message => {
          if (!message.visible) {
            return null;
          }
          if (message.role === "A") {
            return (
              <div key={message.id} className={"chat chat-start"}>
                <div className="chat-header">AI</div>
                <div className="chat-bubble chat-bubble-primary">
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
                  >
                    {message.text as string}
                  </ReactMarkdown>
                </div>
              </div>
            );
          }
          if (message.role === "U") {
            return (
              <div key={message.id} className={"chat chat-end"}>
                <div className="chat-header">You</div>
                <div className="chat-bubble chat-bubble-accent">{message.text as string}</div>
              </div>
            );
          }
          if (message.role === "K") {
            return (
              <div key={message.id} className={"chat chat-start"}>
                <div className="chat-header">System</div>
                <div className="chat-bubble chat-bubble-secondary">
                  <div className="text-base-100">Keywords: {(message.text as KeyWords).keywords.join(", ")}</div>
                  <div className="text-base-200">Description: {(message.text as KeyWords).description}</div>
                  <div className="flex justify-end">
                    <button
                      className="btn btn-success btn-sm"
                      onClick={() =>
                        handleKeywordsUpdate(
                          message.id,
                          (message.text as KeyWords).keywords.join(", "),
                          (message.text as KeyWords).description,
                        )
                      }
                    >
                      Save To Chain
                    </button>
                  </div>
                </div>
              </div>
            );
          }
          if (message.role === "L") {
            return (
              <div key={message.id} className={"chat chat-start"}>
                <div className="chat-header">AI</div>
                <div className="chat-bubble chat-bubble-primary">loading...</div>
              </div>
            );
          }
          message.role;
          return <div key={message.id}></div>;
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="mt-4 p-4 bg-base-200 rounded-xl shadow-lg">
        <form className="flex gap-2" onSubmit={sendMessage}>
          <input
            type="text"
            placeholder="Please enter your message..."
            className="input input-bordered flex-1 focus:outline-none focus:ring-2 focus:ring-primary"
            value={typingMessage}
            onChange={e => setTypingMessage(e.target.value)}
          />
          <button className="btn btn-primary" disabled={chattingDisabled}>
            <PaperAirplaneIcon className="h-5 w-5" />
          </button>
        </form>
      </div>
    </div>
  );
};
export default ChatPage;
