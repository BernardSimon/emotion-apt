"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";


const ProfileLayout = ({ children }: { children: React.ReactNode }) => {

  const pathname = usePathname();
  return (
    <div>
      <div className="flex items-start flex-row flex-grow pt-5 mr-5 ml-5 justify-between">
        <div className="tabs tabs-boxed bg-info">
          <Link href="/about" className={`tab ${pathname === "/about" ? "tab-active" : ""}`}>
            中文
          </Link>
          <Link href="/about/en" className={`tab ${pathname.startsWith("/about/en") ? "tab-active" : ""}`}>
            EN
          </Link>
        </div>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
};

export default ProfileLayout;
