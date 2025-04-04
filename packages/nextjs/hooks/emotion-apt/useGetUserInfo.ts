// import { useEffect } from "react";
// import { useWallet } from "@aptos-labs/wallet-adapter-react";
// import { View } from "~~/hooks/scaffold-move/useView";
//
// type UserInfoContext = {
//   connected: boolean;
//   init: boolean;
//   userInfo: any;
// };
// export const useGetUserInfo = (): UserInfoContext => {
//   // @ts-ignore
//   const response: UserInfoContext = {
//     connected: false,
//   };
//   const { account } = useWallet();
//   useEffect(() => {
//     if (!account?.address) {
//       return;
//     } else {
//       response.connected = true;
//     }
//   }, [account?.address, response]);
//   if (!response.connected) {
//     return response;
//   }
//   const data = View({
//     moduleName: "user_info",
//     functionName: "get_user_info_self",
//     args: [account?.address as `0x${string}`],
//   });
//   if (data.error === null) {
//     return data.data;
//   } else {
//     throw new Error("Not init");
//   }
// };
