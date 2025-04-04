import { create } from "zustand";
import scaffoldConfig from "~~/scaffold.config";
import { UserInfo } from "~~/types/emotion-apt/UserInfo";
import { Chain } from "~~/utils/scaffold-move/chains";

/**
 * Zustand Store
 *
 * You can add global state to the app using this useGlobalState, to get & set
 * values from anywhere in the app.
 *
 * Think about it as a global useState.
 */

// 修复后的代码
type GlobalState = {
  targetNetwork: Chain;
  setTargetNetwork: (newTargetNetwork: Chain) => void;
  agreeAIPolicy: boolean;
  setAgreeAIPolicy: (value: boolean) => void; // 添加状态更新方法
  password: string;
  setPassword: (value: string) => void;
  address: string;
  setAddress: (value: string) => void;
};

export const useGlobalState = create<GlobalState>(set => ({
  targetNetwork: scaffoldConfig.targetNetworks[0],
  setTargetNetwork: (newTargetNetwork: Chain) => set(() => ({ targetNetwork: newTargetNetwork })),
  agreeAIPolicy: false,
  setAgreeAIPolicy: (value: boolean) => set(() => ({ agreeAIPolicy: value })), // 添加状态更新函数
  password: "",
  setPassword: (value: string) => set(() => ({ password: value })),
  address: "",
  setAddress: (value: string) => set(() => ({ address: value })),
}));

export const useUserInfo = create<UserInfo>(set => ({
  valid_msg: "",
  name: "",
  sex: "",
  date_of_birth: "",
  education: "",
  occupation: "",
  counselling_hours: "",
  orientations: "",
  techniques: "",
  setUserInfo: (userInfo: UserInfo) => set(() => ({ ...userInfo })),
}));
