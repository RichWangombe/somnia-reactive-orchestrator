import Link from "next/link";

import { ConnectWalletButton } from "./ConnectWalletButton";

const navItems = [
  { href: "/", label: "Overview" },
  { href: "/create", label: "Create Rule" },
  { href: "/rules", label: "Rules" },
  { href: "/feed", label: "Live Feed" },
  { href: "/templates", label: "Templates" },
];

export function Navbar() {
  return (
    <header className="sticky top-0 z-20 border-b border-white/5 bg-slate-950/70 backdrop-blur-xl">
      <div className="mx-auto flex w-[min(1180px,calc(100vw-2rem))] items-center justify-between py-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="rounded-2xl border border-emerald-300/30 bg-emerald-300/10 px-3 py-2 text-xs uppercase tracking-[0.25em] text-emerald-200">
            ROP
          </div>
          <div>
            <div className="text-sm text-white">Reactive Intent Rail</div>
            <div className="text-xs text-slate-400">Somnia automation substrate</div>
          </div>
        </Link>

        <nav className="hidden gap-6 text-sm text-slate-300 md:flex">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="transition hover:text-white">
              {item.label}
            </Link>
          ))}
        </nav>

        <ConnectWalletButton />
      </div>
    </header>
  );
}
