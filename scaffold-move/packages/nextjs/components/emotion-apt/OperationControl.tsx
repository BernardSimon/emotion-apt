import { useEffect, useRef, useState } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { toast } from "react-hot-toast";
import InitModal from "~~/components/emotion-apt/InitModal";
import PasswordModal from "~~/components/emotion-apt/PasswordModal";
import { useView } from "~~/hooks/scaffold-move/useView";
import { useGlobalState } from "~~/services/store/store";

type UserInfo = {
  valid_msg: string;
  name: string;
  sex: string;
  date_of_birth: string;
  education: string;
  ocupation: string;
  counselinghours: string;
  orientations: string;
  techniques: string;
};
export const OperationControl = () => {
  const [InitModalOpen, SetInitModalOpen] = useState(false);
  const [PasswordModalOpen, SetPasswordModalOpen] = useState(false);
  const store = useGlobalState();
  const { disconnect } = useWallet();
  const valid_msg = useRef("");
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
        valid_msg.current = userinfo[0].valid_msg;
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
        valid_msg={valid_msg.current}
        onFinished={passwordFinished}
        onForget={passwordForget}
      />
    </>
  );
};
