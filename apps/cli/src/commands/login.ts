import chalk from "chalk";
import ora from "ora";
import inquirer from "inquirer";
import Conf from "conf";
import { deriveKey, saveCredentials } from "../lib/crypto.js";

const config = new Conf({ projectName: "envvault" });

export async function login() {
  console.log(chalk.green("\n🔐 EnvVault Login\n"));

  const answers = await inquirer.prompt([
    {
      type: "input",
      name: "email",
      message: "Email:",
      validate: (input: string) => {
        if (!input.includes("@")) return "Please enter a valid email";
        return true;
      },
    },
    {
      type: "password",
      name: "password",
      message: "Master password:",
      mask: "*",
      validate: (input: string) => {
        if (input.length < 8) return "Password must be at least 8 characters";
        return true;
      },
    },
  ]);

  const spinner = ora("Deriving encryption key...").start();

  try {
    // Derive encryption key from password
    const { key, salt } = await deriveKey(answers.password);

    // Save credentials (salt only, never the password or key)
    await saveCredentials(answers.email, salt);

    // Cache the key for this session
    config.set("session.email", answers.email);
    config.set("session.keyDerived", true);

    spinner.succeed("Logged in successfully!");

    console.log(chalk.dim(`\nYour encryption key has been derived locally.`));
    console.log(chalk.dim(`It never leaves your machine.\n`));

    console.log(chalk.green("Next steps:"));
    console.log(chalk.dim("  envvault init         Initialize in current directory"));
    console.log(chalk.dim("  envvault pull dev     Pull development secrets"));
    console.log(chalk.dim("  envvault run -- npm start   Run with secrets\n"));
  } catch (error) {
    spinner.fail("Login failed");
    console.error(chalk.red(error));
    process.exit(1);
  }
}
