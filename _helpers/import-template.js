const Listr = require('listr');
const { promisify } = require('util');
const path = require('path');
const fs = require('fs');
const inquirer = require('inquirer');

const mkdir = promisify(fs.mkdir);

const {
  promptQuestions,
  copyTemplateFiles,
  copyFunctionsAndAssets,
  addToTemplatesJson,
  isServerlessProject,
  parseServerlessProject,
  generateEnvExampleFromRealEnv,
  addToPackageJson,
} = require('./utils/new-template');

async function run(args) {
  const [, , existingProjectPath] = args;

  const fullExistingProjectPath = path.resolve(existingProjectPath);

  if (!(await isServerlessProject(fullExistingProjectPath))) {
    throw new Error(
      `Invalid project structure. The path you specfied does not match what a Twilio Serverless project should look like. Please point the tool at the root of a project created with "twilio serverless:init".`
    );
  }

  const { dependencies, functions, assets, hasEnvFile } =
    await parseServerlessProject(fullExistingProjectPath);

  let shouldGenerateEnvFile = false;
  if (hasEnvFile) {
    const { confirm } = await inquirer.prompt({
      name: 'confirm',
      type: 'confirm',
      message:
        'We found a .env file. Do you want to use it as the base for your .env.example file? IMPORTANT: We will try to scrape any data from it but please double check before committing the file.',
      default: false,
    });
    shouldGenerateEnvFile = confirm;
  }

  const { name, description, title } = await promptQuestions();

  if (!name || !description || !title) {
    throw new Error('Internal error');
  }

  const targetPath = path.resolve(__dirname, '..', name);

  const tasks = new Listr([
    {
      title: 'Creating template directory',
      task: () => mkdir(targetPath),
    },
    {
      title: 'Copy intial template files',
      task: () =>
        copyTemplateFiles(targetPath, { name, description, dependencies }),
    },
    {
      title: 'Copy your Functions & Assets',
      task: () => copyFunctionsAndAssets(targetPath, { functions, assets }),
    },
    {
      title: 'Update .env.example file',
      task: () =>
        generateEnvExampleFromRealEnv(fullExistingProjectPath, targetPath),
      skip: () => !shouldGenerateEnvFile,
    },
    {
      title: 'Adding template to templates.json',
      task: () => addToTemplatesJson(name, title, description),
    },
    {
      title: 'Adding template to package.json',
      task: () => addToPackageJson(name),
    },
  ]);

  await tasks.run();

  const successMessage = `

    Template created

    You can find your template in the directory ${targetPath}.

    More information on how to modify and contribute your template can be found in the contributing docs:
    https://github.com/twilio-labs/function-templates/blob/main/docs/CONTRIBUTING.md
    `;

  console.warn(successMessage);
}

run(process.argv).catch((err) => {
  if (err.code && err.code === 'EEXIST') {
    console.error(
      `The name you specified already exists. Please pick a name that is not currently a directory name in this project`
    );
  } else {
    console.error(err.message);
  }
});
