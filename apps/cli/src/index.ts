#!/usr/bin/env node
/**
 * EnvVault CLI
 *
 * Zero-knowledge secrets management from the command line.
 *
 * Usage:
 *   envvault login           - Authenticate with EnvVault
 *   envvault pull <env>      - Pull secrets to .env file
 *   envvault push <env>      - Push .env file to EnvVault
 *   envvault run -- <cmd>    - Run command with secrets injected
 *   envvault diff <a> <b>    - Compare secrets between environments
 *   envvault share <key>     - Generate share link for a secret
 */

import { Command } from "commander";
import chalk from "chalk";
import ora from "ora";
import { login } from "./commands/login.js";
import { pull } from "./commands/pull.js";
import { push } from "./commands/push.js";
import { run } from "./commands/run.js";
import { diff } from "./commands/diff.js";
import { share } from "./commands/share.js";
import { init } from "./commands/init.js";

const program = new Command();

program
  .name("envvault")
  .description("Zero-knowledge secrets management")
  .version("0.1.0");

// Login command
program
  .command("login")
  .description("Authenticate with EnvVault")
  .action(login);

// Init command
program
  .command("init")
  .description("Initialize EnvVault in current directory")
  .option("-w, --workspace <name>", "Workspace name")
  .action(init);

// Pull command
program
  .command("pull [environment]")
  .description("Pull secrets to .env file")
  .option("-o, --output <file>", "Output file path", ".env")
  .option("-f, --force", "Overwrite existing file")
  .action(pull);

// Push command
program
  .command("push [environment]")
  .description("Push .env file to EnvVault")
  .option("-i, --input <file>", "Input file path", ".env")
  .action(push);

// Run command
program
  .command("run")
  .description("Run command with secrets injected")
  .option("-e, --env <environment>", "Environment to use", "development")
  .argument("<command...>", "Command to run")
  .action(run);

// Diff command
program
  .command("diff <env1> <env2>")
  .description("Compare secrets between environments")
  .action(diff);

// Share command
program
  .command("share <key>")
  .description("Generate share link for a secret")
  .option("-e, --env <environment>", "Environment", "development")
  .option("--expires <duration>", "Link expiry (1h, 24h, 7d)", "24h")
  .action(share);

// Parse arguments
program.parse();

// Show help if no command
if (!process.argv.slice(2).length) {
  console.log(chalk.green(`
  ╔═══════════════════════════════════════╗
  ║                                       ║
  ║   ${chalk.bold("EnvVault")} - Share secrets safely     ║
  ║   Never WhatsApp .env files again     ║
  ║                                       ║
  ╚═══════════════════════════════════════╝
  `));
  program.outputHelp();
}
