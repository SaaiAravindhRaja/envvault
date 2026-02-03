import chalk from "chalk";
import ora from "ora";
import Conf from "conf";
import { getSecrets } from "../lib/api.js";
import { decryptSecrets } from "../lib/crypto.js";

const config = new Conf({ projectName: "envvault" });

export async function diff(env1: string, env2: string) {
  // Check if logged in
  if (!config.get("session.email")) {
    console.log(chalk.yellow("\n⚠️  Not logged in. Run `envvault login` first.\n"));
    process.exit(1);
  }

  console.log(chalk.green(`\n🔍 Comparing ${chalk.bold(env1)} vs ${chalk.bold(env2)}\n`));

  const spinner = ora("Loading secrets from both environments...").start();

  try {
    // Fetch both environments
    const [enc1, enc2] = await Promise.all([
      getSecrets(env1),
      getSecrets(env2),
    ]);

    spinner.text = "Decrypting...";

    const [secrets1, secrets2] = await Promise.all([
      decryptSecrets(enc1),
      decryptSecrets(enc2),
    ]);

    spinner.stop();

    const allKeys = new Set([
      ...Object.keys(secrets1),
      ...Object.keys(secrets2),
    ]);

    let added = 0;
    let removed = 0;
    let changed = 0;
    let same = 0;

    console.log(chalk.dim(`${"KEY".padEnd(30)} ${env1.padEnd(15)} ${env2.padEnd(15)} STATUS\n`));

    Array.from(allKeys)
      .sort()
      .forEach((key) => {
        const val1 = secrets1[key];
        const val2 = secrets2[key];

        const mask = (v: string) => v ? `${v.slice(0, 4)}...` : "-";

        if (!val1) {
          // Only in env2
          console.log(
            chalk.green(`${key.padEnd(30)} ${"-".padEnd(15)} ${mask(val2).padEnd(15)} + added`)
          );
          added++;
        } else if (!val2) {
          // Only in env1
          console.log(
            chalk.red(`${key.padEnd(30)} ${mask(val1).padEnd(15)} ${"-".padEnd(15)} - removed`)
          );
          removed++;
        } else if (val1 !== val2) {
          // Different
          console.log(
            chalk.yellow(`${key.padEnd(30)} ${mask(val1).padEnd(15)} ${mask(val2).padEnd(15)} ~ changed`)
          );
          changed++;
        } else {
          // Same
          console.log(
            chalk.dim(`${key.padEnd(30)} ${mask(val1).padEnd(15)} ${mask(val2).padEnd(15)} = same`)
          );
          same++;
        }
      });

    console.log(chalk.dim(`\n${"─".repeat(70)}`));
    console.log(
      chalk.green(`+ ${added} added`) +
        "  " +
        chalk.red(`- ${removed} removed`) +
        "  " +
        chalk.yellow(`~ ${changed} changed`) +
        "  " +
        chalk.dim(`= ${same} same`)
    );
    console.log();
  } catch (error) {
    spinner.fail("Failed to compare environments");
    console.error(chalk.red(error));
    process.exit(1);
  }
}
