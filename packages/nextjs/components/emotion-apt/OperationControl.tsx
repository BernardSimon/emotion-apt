import { useEffect, useState } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { toast } from "react-hot-toast";
import InitModal from "~~/components/emotion-apt/InitModal";
import PasswordModal from "~~/components/emotion-apt/PasswordModal";
import { useView } from "~~/hooks/scaffold-move/useView";
import { useGlobalState } from "~~/services/store/store";
import { UserInfo } from "~~/types/emotion-apt/UserInfo";

export const OperationControl = () => {
  const [InitModalOpen, SetInitModalOpen] = useState(false);
  const [PasswordModalOpen, SetPasswordModalOpen] = useState(false);
  const store = useGlobalState();
  const { disconnect } = useWallet();
  const [userInfo, setUserInfo] = useState<UserInfo>({
    valid_msg: "",
    name: "",
    sex: "",
    date_of_birth: "",
    education: "",
    occupation: "",
    counselling_hours: "",
    orientations: "",
    techniques: "",
    setUserInfo: (value: UserInfo) => {
      setUserInfo(value);
    },
  });
  const { data, error } = useView({
    moduleName: "user_info",
    functionName: "get_user_info_self",
    args: [store.address as `0x${string}`],
  });
  useEffect(() => {
    if (error && store.address && store.password == "") {
      SetInitModalOpen(true);
    }
    if (data) {
      if (store.password == "") {
        const userinfo = data as unknown as UserInfo[];
        setUserInfo(userinfo[0]);
        SetPasswordModalOpen(true);
      }
    }
  }, [data, error, store.password]);
  const initClose = () => {
    disconnect();
    window.location.reload();
    SetInitModalOpen(false);
  };
  const initFinished = () => {
    SetInitModalOpen(false);
  };
  const passwordFinished = () => {
    SetPasswordModalOpen(false);
  };
  const passwordForget = () => {
    toast.error("Forget password have to reset your data");
    SetPasswordModalOpen(false);
    SetInitModalOpen(true);
  };
  return (
    <>
      <InitModal open={InitModalOpen} onClosed={initClose} onFinished={initFinished} />
      <PasswordModal
        open={PasswordModalOpen}
        userInfo={userInfo}
        onFinished={passwordFinished}
        onForget={passwordForget}
      />
    </>
  );
};
