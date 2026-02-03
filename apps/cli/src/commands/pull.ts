import chalk from "chalk";
import ora from "ora";
import { existsSync, writeFileSync, readFileSync } from "fs";
import { join } from "path";
import Conf from "conf";
import inquirer from "inquirer";
import { getSecrets } from "../lib/api.js";
import { decryptSecrets } from "../lib/crypto.js";

const config = new Conf({ projectName: "envvault" });

export async function pull(
  environment: string = "development",
  options: { output: string; force?: boolean }
) {
  // Check if logged in
  if (!config.get("session.email")) {
    console.log(chalk.yellow("\n⚠️  Not logged in. Run `envvault login` first.\n"));
    process.exit(1);
  }

  const outputPath = options.output || ".env";
  const fullPath = join(process.cwd(), outputPath);

  // Check if file exists
  if (existsSync(fullPath) && !options.force) {
    const { overwrite } = await inquirer.prompt([
      {
        type: "confirm",
        name: "overwrite",
        message: `${outputPath} already exists. Overwrite?`,
        default: false,
      },
    ]);

    if (!overwrite) {
      console.log(chalk.dim("Aborted."));
      return;
    }
  }

  console.log(chalk.green(`\n📥 Pulling ${chalk.bold(environment)} secrets\n`));

  const spinner = ora("Fetching encrypted secrets...").start();

  try {
    // Fetch encrypted secrets from API
    const encryptedSecrets = await getSecrets(environment);
    spinner.text = "Decrypting secrets locally...";

    // Decrypt locally (key never leaves machine)
    const secrets = await decryptSecrets(encryptedSecrets);

    // Write to .env file
    const envContent = Object.entries(secrets)
      .map(([key, value]) => {
        // Quote values with spaces or special chars
        if (value.includes(" ") || value.includes("=") || value.includes("#")) {
          return `${key}="${value}"`;
        }
        return `${key}=${value}`;
      })
      .join("\n");

    writeFileSync(fullPath, envContent + "\n");

    spinner.succeed(`Pulled ${Object.keys(secrets).length} secrets to ${outputPath}`);

    console.log(chalk.dim(`\nSecrets for ${environment}:`));
    Object.keys(secrets).forEach((key) => {
      console.log(chalk.dim(`  ${chalk.green("✓")} ${key}`));
    });
    console.log();
  } catch (error) {
    spinner.fail("Failed to pull secrets");
    console.error(chalk.red(error));
    process.exit(1);
  }
}
