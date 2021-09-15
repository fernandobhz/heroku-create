const fs = require(`fs/promises`);
const path = require(`path`);
const INI = require(`ini`);
const { exec: execCallback } = require(`child_process`);

const exec = (command) =>
  new Promise((resolve, reject) =>
    execCallback(command, (error, stdout, stderr) => {
      if (error) return reject(error);
      log(stdout);
      consoleError(stderr);
      return resolve(`${stdout}\n${stderr}`);
    })
  );

const { log, error: consoleError } = console;

const die = (...args) => {
  consoleError(...args);
  process.exit(1);
};

async function buildAppName() {
  const gitConfigPath = path.join(process.cwd(), `.git`, `config`);
  const gitConfigContent = await fs.readFile(gitConfigPath, `utf8`);
  const gitConfig = INI.parse(gitConfigContent);
  const { url: originUrl } = gitConfig[`remote "origin"`];

  const originUrlParts = originUrl.split(`/`).reverse();
  const [projectName, userName] = originUrlParts;

  const herokuAppName = `${projectName}-${userName}`;
  return herokuAppName;

  // const packageJsonPath = path.join(process.cwd(), `package.json`);
  // const packageJsonContent = await fs.readFile(packageJsonPath, `utf8`);
  // const packageJson = JSON.parse(packageJsonContent);
  // const { name: appName, repository } = packageJson;

  // if (repository) {
  //   const { url: repositoryUrl } = repository;
  //   const repositoryUrlParts = repositoryUrl.split(`/`).reverse();
  //   const [projectName, userName] = repositoryUrlParts;

  //   const herokuAppName = `${projectName}-${userName}`;
  //   return herokuAppName;
  // }

  // const { USERNAME: windowsUserName } = process.env;

  // if (windowsUserName) {
  //   const herokuAppName = `${appName}-${windowsUserName}`;
  //   return herokuAppName;
  // }

  // const randomChars = Math.random().toString(36).slice(-5);
  // const herokuAppName = `${appName}-${randomChars}`;
  // return herokuAppName;
}

async function run() {
  const appName = await buildAppName();
  await exec(`heroku create ${appName}`);
  await exec(`git push heroku`);
  await exec(`heroku open`);
}

run();
