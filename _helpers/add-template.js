const Listr = require('listr');
const { promisify } = require('util');
const path = require('path');
const fs = require('fs');

const mkdir = promisify(fs.mkdir);

const {
  promptQuestions,
  copyTemplateFiles,
  addToTemplatesJson,
  addToPackageJson,
} = require('./utils/new-template');

async function run() {
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
      task: () => copyTemplateFiles(targetPath, { name, description }),
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
  https://github.com/twilio-labs/function-templates/blob/master/docs/CONTRIBUTING.md
  `;

  console.warn(successMessage);
}

run().catch((err) => {
  if (err.code && err.code === 'EEXIST') {
    console.error(
      `The name you specified already exists. Please pick a name that is not currently a directory name in this project`
    );
  } else {
    console.error(err.message);
  }
});
