import { POST } from "../../go/utils/axios/axios";
import {ChatRequest, ChatResponse} from "~~/types/emotion-apt/chat";

export function ChatApi(params: ChatRequest) {
  return POST<ChatResponse, ChatRequest>("/chat", params);
}
