import chalk from "chalk";
import ora from "ora";
import { spawn } from "child_process";
import Conf from "conf";
import { getSecrets } from "../lib/api.js";
import { decryptSecrets } from "../lib/crypto.js";

const config = new Conf({ projectName: "envvault" });

export async function run(
  command: string[],
  options: { env: string }
) {
  // Check if logged in
  if (!config.get("session.email")) {
    console.log(chalk.yellow("\n⚠️  Not logged in. Run `envvault login` first.\n"));
    process.exit(1);
  }

  const environment = options.env || "development";
  const spinner = ora(`Loading ${environment} secrets...`).start();

  try {
    // Fetch and decrypt secrets
    const encryptedSecrets = await getSecrets(environment);
    const secrets = await decryptSecrets(encryptedSecrets);

    spinner.succeed(`Injecting ${Object.keys(secrets).length} environment variables`);

    // Merge with existing env
    const env = {
      ...process.env,
      ...secrets,
    };

    // Run the command
    const [cmd, ...args] = command;

    console.log(chalk.dim(`\n$ ${command.join(" ")}\n`));

    const child = spawn(cmd, args, {
      env,
      stdio: "inherit",
      shell: true,
    });

    child.on("exit", (code) => {
      process.exit(code || 0);
    });
  } catch (error) {
    spinner.fail("Failed to load secrets");
    console.error(chalk.red(error));
    process.exit(1);
  }
}
