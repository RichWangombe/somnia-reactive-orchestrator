import * as fs from "node:fs/promises";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");

async function main() {
  const networkName = process.argv[2] ?? "localhost";
  const filePath = path.join(ROOT_DIR, "deployments", `${networkName}.json`);
  const raw = await fs.readFile(filePath, "utf8");
  console.log(raw);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
