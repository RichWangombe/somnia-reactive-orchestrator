import { guardianDefaults, sampleFeedEvents, templateCatalog } from "@rop/shared";

export const homeStats = [
  {
    label: "Primary Primitive",
    value: "Real-time execution rail",
    detail: "Trigger, evaluate, dispatch, and receipt in one continuous rail.",
  },
  {
    label: "Flagship Template",
    value: "Guardian Vault",
    detail: "A reactive stop-loss pair for price and vault health thresholds.",
  },
  {
    label: "Watcher Mode",
    value: "Somnia Reactivity + mock fallback",
    detail: "Same contract interfaces in both real and local demo mode.",
  },
] as const;

export { guardianDefaults, sampleFeedEvents, templateCatalog };
