import * as fs from "node:fs/promises";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");

export async function verifyEnv() {
  const deploymentFiles = ["localhost.json", "somniaTestnet.json"];
  const existingFiles: string[] = [];

  for (const fileName of deploymentFiles) {
    try {
      await fs.access(path.join(ROOT_DIR, "deployments", fileName));
      existingFiles.push(fileName);
    } catch {
      // Ignore missing deployment artifacts.
    }
  }

  return {
    hasRootEnv: await exists(path.join(ROOT_DIR, ".env")),
    deploymentFiles: existingFiles,
  };
}

async function exists(filePath: string) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}
