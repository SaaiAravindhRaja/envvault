import chalk from "chalk";
import ora from "ora";
import Conf from "conf";
import { getSecret } from "../lib/api.js";
import { createShareLink } from "../lib/crypto.js";

const config = new Conf({ projectName: "envvault" });

export async function share(
  key: string,
  options: { env: string; expires: string }
) {
  // Check if logged in
  if (!config.get("session.email")) {
    console.log(chalk.yellow("\n⚠️  Not logged in. Run `envvault login` first.\n"));
    process.exit(1);
  }

  const environment = options.env || "development";
  const expires = options.expires || "24h";

  console.log(chalk.green(`\n🔗 Sharing ${chalk.bold(key)} from ${environment}\n`));

  const spinner = ora("Generating secure share link...").start();

  try {
    // Fetch the secret
    const encryptedSecret = await getSecret(environment, key);

    if (!encryptedSecret) {
      spinner.fail(`Secret '${key}' not found in ${environment}`);
      process.exit(1);
    }

    // Create share link
    const shareLink = await createShareLink(encryptedSecret, expires);

    spinner.succeed("Share link generated!");

    console.log(chalk.dim(`\nLink expires: ${expires}`));
    console.log(chalk.dim(`One-time use: Yes\n`));

    console.log(chalk.bold("Share Link:"));
    console.log(chalk.cyan(shareLink));

    console.log(chalk.dim(`\n${"─".repeat(50)}`));
    console.log(chalk.dim("The recipient will need to enter your master password"));
    console.log(chalk.dim("to decrypt the secret. EnvVault never sees the plaintext.\n"));
  } catch (error) {
    spinner.fail("Failed to create share link");
    console.error(chalk.red(error));
    process.exit(1);
  }
}
