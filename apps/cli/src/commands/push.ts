import chalk from "chalk";
import ora from "ora";
import { existsSync, readFileSync } from "fs";
import { join } from "path";
import Conf from "conf";
import inquirer from "inquirer";
import { pushSecrets } from "../lib/api.js";
import { encryptSecrets, parseEnvFile } from "../lib/crypto.js";

const config = new Conf({ projectName: "envvault" });

export async function push(
  environment: string = "development",
  options: { input: string }
) {
  // Check if logged in
  if (!config.get("session.email")) {
    console.log(chalk.yellow("\n⚠️  Not logged in. Run `envvault login` first.\n"));
    process.exit(1);
  }

  const inputPath = options.input || ".env";
  const fullPath = join(process.cwd(), inputPath);

  // Check if file exists
  if (!existsSync(fullPath)) {
    console.log(chalk.red(`\n❌ File not found: ${inputPath}\n`));
    process.exit(1);
  }

  console.log(chalk.green(`\n📤 Pushing to ${chalk.bold(environment)}\n`));

  // Read and parse .env file
  const content = readFileSync(fullPath, "utf-8");
  const secrets = parseEnvFile(content);

  console.log(chalk.dim(`Found ${Object.keys(secrets).length} secrets:`));
  Object.keys(secrets).forEach((key) => {
    console.log(chalk.dim(`  • ${key}`));
  });
  console.log();

  // Confirm push
  const { confirm } = await inquirer.prompt([
    {
      type: "confirm",
      name: "confirm",
      message: `Push these secrets to ${environment}?`,
      default: true,
    },
  ]);

  if (!confirm) {
    console.log(chalk.dim("Aborted."));
    return;
  }

  const spinner = ora("Encrypting secrets locally...").start();

  try {
    // Encrypt locally (plaintext never leaves machine)
    const encryptedSecrets = await encryptSecrets(secrets);
    spinner.text = "Pushing encrypted secrets...";

    // Push to API
    await pushSecrets(environment, encryptedSecrets);

    spinner.succeed(`Pushed ${Object.keys(secrets).length} secrets to ${environment}`);
    console.log(chalk.dim(`\nServer only received encrypted data.\n`));
  } catch (error) {
    spinner.fail("Failed to push secrets");
    console.error(chalk.red(error));
    process.exit(1);
  }
}
