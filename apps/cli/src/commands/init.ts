import chalk from "chalk";
import ora from "ora";
import inquirer from "inquirer";
import { existsSync, writeFileSync, mkdirSync } from "fs";
import { join } from "path";
import Conf from "conf";

const config = new Conf({ projectName: "envvault" });

export async function init(options: { workspace?: string }) {
  // Check if logged in
  if (!config.get("session.email")) {
    console.log(chalk.yellow("\n⚠️  Not logged in. Run `envvault login` first.\n"));
    process.exit(1);
  }

  const envvaultDir = join(process.cwd(), ".envvault");

  // Check if already initialized
  if (existsSync(envvaultDir)) {
    console.log(chalk.yellow("\n⚠️  EnvVault already initialized in this directory.\n"));
    return;
  }

  console.log(chalk.green("\n🚀 Initializing EnvVault\n"));

  // Get workspace name
  let workspaceName = options.workspace;

  if (!workspaceName) {
    const answers = await inquirer.prompt([
      {
        type: "input",
        name: "workspace",
        message: "Workspace name:",
        default: process.cwd().split("/").pop(),
        validate: (input: string) => {
          if (!/^[a-z0-9-]+$/.test(input)) {
            return "Use lowercase letters, numbers, and hyphens only";
          }
          return true;
        },
      },
    ]);
    workspaceName = answers.workspace;
  }

  const spinner = ora("Creating workspace...").start();

  try {
    // Create .envvault directory
    mkdirSync(envvaultDir);

    // Create config file
    const configContent = {
      workspace: workspaceName,
      environments: ["development", "staging", "production"],
      defaultEnvironment: "development",
    };

    writeFileSync(
      join(envvaultDir, "config.json"),
      JSON.stringify(configContent, null, 2)
    );

    // Create .gitignore
    writeFileSync(join(envvaultDir, ".gitignore"), "*.env\n");

    // Create example env files
    const envExample = `# EnvVault - ${workspaceName}
# Run 'envvault pull development' to fetch secrets

DATABASE_URL=
REDIS_URL=
API_KEY=
`;

    writeFileSync(join(envvaultDir, "development.env.example"), envExample);

    // Add to project .gitignore
    const gitignorePath = join(process.cwd(), ".gitignore");
    if (existsSync(gitignorePath)) {
      const content = require("fs").readFileSync(gitignorePath, "utf-8");
      if (!content.includes(".envvault/*.env")) {
        require("fs").appendFileSync(gitignorePath, "\n# EnvVault\n.envvault/*.env\n");
      }
    }

    spinner.succeed(`Workspace '${workspaceName}' initialized!`);

    console.log(chalk.dim(`\nCreated:`));
    console.log(chalk.dim(`  .envvault/config.json`));
    console.log(chalk.dim(`  .envvault/.gitignore`));
    console.log(chalk.dim(`  .envvault/development.env.example\n`));

    console.log(chalk.green("Next steps:"));
    console.log(chalk.dim(`  1. Add secrets on the web: ${chalk.cyan("https://envvault.dev/dashboard")}`));
    console.log(chalk.dim(`  2. Pull secrets: ${chalk.cyan("envvault pull development")}`));
    console.log(chalk.dim(`  3. Run with secrets: ${chalk.cyan("envvault run -- npm start")}\n`));
  } catch (error) {
    spinner.fail("Failed to initialize");
    console.error(chalk.red(error));
    process.exit(1);
  }
}
