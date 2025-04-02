import { create } from "zustand";
import scaffoldConfig from "~~/scaffold.config";
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

type UserProfile = {
  name: string;
  sex: string;
  birth_date: string;
  occupation: string;
  education: string;
  consulting_hours: string;
  orientation: string;
  technique: string;
  setUserProfile: (
    name: string,
    sex: string,
    birth_date: string,
    occupation: string,
    education: string,
    consulting_hours: string,
    orientation: string,
    technique: string,
  ) => void;
};

export const useUserProfile = create<UserProfile>(set => ({
  name: "",
  sex: "",
  birth_date: "",
  occupation: "",
  education: "",
  consulting_hours: "",
  orientation: "",
  technique: "",
  setUserProfile: (
    name: string,
    sex: string,
    birth_date: string,
    occupation: string,
    education: string,
    consulting_hours: string,
    orientation: string,
    technique: string,
  ) =>
    set(() => ({
      name: name,
      sex: sex,
      birth_date: birth_date,
      occupation: occupation,
      education: education,
      consulting_hours: consulting_hours,
      orientation: orientation,
      technique: technique,
    })),
}));
