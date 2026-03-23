"use client";

import { useAccount, useConnect, useDisconnect } from "wagmi";

import { shortAddress } from "../lib/utils";

export function ConnectWalletButton() {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const connector = connectors[0];

  if (isConnected) {
    return (
      <button
        className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white transition hover:border-emerald-300/50 hover:bg-white/10"
        onClick={() => disconnect()}
        type="button"
      >
        {shortAddress(address)}
      </button>
    );
  }

  return (
      <button
        className="rounded-full bg-emerald-300 px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-emerald-200"
        onClick={() => {
          if (connector) {
            connect({ connector });
          }
        }}
        type="button"
        disabled={isPending || !connector}
      >
        {isPending ? "Connecting..." : "Connect Wallet"}
      </button>
  );
}
