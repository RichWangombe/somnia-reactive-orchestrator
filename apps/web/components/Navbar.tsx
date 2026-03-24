"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { ConnectWalletButton } from "./ConnectWalletButton";

const navItems = [
  { href: "/", label: "Overview" },
  { href: "/create", label: "Create Rule" },
  { href: "/rules", label: "Rules" },
  { href: "/feed", label: "Live Feed" },
  { href: "/templates", label: "Templates" },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 px-4 pt-4 md:px-6">
      <div className="mx-auto w-[min(1180px,calc(100vw-2rem))]">
        <div className="panel rounded-[30px] px-4 py-4 md:px-6">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
            <Link href="/" className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-300/30 bg-emerald-300/12 font-mono text-xs uppercase tracking-[0.28em] text-emerald-200">
                ROP
              </div>

              <div className="space-y-1">
                <div className="eyebrow">Reactive Intent Rail</div>
                <div className="text-lg font-semibold tracking-[-0.03em] text-white md:text-xl">
                  Somnia automation substrate
                </div>
                <p className="max-w-lg text-sm leading-6 text-slate-400">
                  Real-time, programmable reactions for contracts, vaults, treasuries, and protocol workflows.
                </p>
              </div>
            </Link>

            <div className="flex flex-col gap-4 xl:items-end">
              <nav className="flex flex-wrap gap-2">
                {navItems.map((item) => {
                  const active = pathname === item.href;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`rounded-full px-4 py-2 text-sm transition ${
                        active
                          ? "bg-white/12 text-white shadow-[inset_0_0_0_1px_rgba(126,240,199,0.28)]"
                          : "text-slate-300 hover:bg-white/6 hover:text-white"
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </nav>

              <ConnectWalletButton />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
