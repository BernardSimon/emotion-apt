"use client";

import { useRouter } from "next/navigation";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import type { NextPage } from "next";
import { MagnifyingGlassIcon, SignalIcon } from "@heroicons/react/24/outline";
import { Address } from "~~/components/scaffold-move";

const Home: NextPage = () => {
  const { account: connectedAccount } = useWallet();
  const router = useRouter();

  return (
    <>
      <div className="flex items-center flex-col flex-grow pt-10">
        <div className="px-5">
          <h1 className="text-center">
            <span className="block text-2xl mb-2">Welcome to</span>
            <span className="block text-4xl font-bold">Emotion APT</span>
          </h1>
          <div className="flex justify-center items-center space-x-2 flex-col sm:flex-row">
            <p className="my-2 font-medium">Connected Address:</p>

            <Address address={connectedAccount?.address} />
          </div>
        </div>

        <div className="flex-grow bg-base-300 w-full mt-16 px-8 py-12">
          <div className="flex justify-center items-center gap-12 flex-col sm:flex-row">
            <div
              className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl"
              onClick={() => {
                router.push("/chat");
              }}
            >
              <SignalIcon className="h-8 w-8 fill-secondary" />
              <p>AI psychological counselors are available online anytime</p>
            </div>
            <div
              className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl"
              onClick={() => {
                router.push("/profile");
              }}
            >
              <MagnifyingGlassIcon className="h-8 w-8 fill-secondary" />
              <p>Explore or edit your profile information with our Tools</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
