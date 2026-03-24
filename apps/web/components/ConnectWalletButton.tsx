"use client";

import { useAccount, useConnect, useDisconnect } from "wagmi";

import { shortAddress } from "../lib/utils";

const baseClassName =
  "inline-flex items-center justify-center rounded-full border px-4 py-2.5 text-sm font-medium transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:cursor-not-allowed disabled:opacity-60";

export function ConnectWalletButton() {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const connector = connectors[0];

  if (isConnected) {
    return (
      <button
        className={`${baseClassName} border-white/10 bg-white/5 text-white hover:border-emerald-300/40 hover:bg-white/10`}
        onClick={() => disconnect()}
        type="button"
      >
        <span className="mr-2 h-2 w-2 rounded-full bg-emerald-300" />
        {shortAddress(address)}
      </button>
    );
  }

  return (
    <button
      className={`${baseClassName} border-emerald-300/30 bg-emerald-300 text-slate-950 hover:-translate-y-0.5 hover:bg-emerald-200`}
      onClick={() => {
        if (connector) {
          connect({ connector });
        }
      }}
      type="button"
      disabled={isPending || !connector}
    >
      {isPending ? "Connecting..." : connector ? "Connect Wallet" : "Wallet Unavailable"}
    </button>
  );
}
