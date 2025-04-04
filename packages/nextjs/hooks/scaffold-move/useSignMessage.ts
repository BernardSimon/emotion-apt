import { useWallet } from "@aptos-labs/wallet-adapter-react";
import {useMemo} from "react";

const useSignMessage = () => {
  const { signMessage } = useWallet();
  const salt = useMemo(() => {
    const array = crypto.getRandomValues(new Uint8Array(16));
    return Array.from(array)
      .map(b => b.toString(16).padStart(2, "0"))
      .join("");
  }, []);
  return async (message: string) => {
    return await signMessage({
      address: false,
      chainId: false,
      application: false,
      message: message,
      nonce: salt,
    });
  };
};

export default useSignMessage;
