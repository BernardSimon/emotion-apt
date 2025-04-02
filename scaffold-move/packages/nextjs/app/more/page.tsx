"use client";

import { useRouter } from "next/navigation";
import type { NextPage } from "next";

const More: NextPage = () => {
  const router = useRouter();
  return (
    <div className="flex items-center flex-col flex-grow pt-10">
      <div className="px-5">
        <h1 className="text-center">
          <span className="block text-2xl mb-2">Emotion Apt</span>
          <span className="block text-4xl font-bold">No More Content</span>
          <button className="btn btn-primary mt-10" onClick={() => router.push("/")}>
            Back To Home
          </button>
        </h1>
      </div>
    </div>
  );
};

export default More;
