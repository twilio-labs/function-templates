const inquirer = require('inquirer');
const Listr = require('listr');
const copy = require('copy-template-dir');
const { promisify } = require('util');
const path = require('path');
const fs = require('fs');
const { error, success } = require('log-symbols');

const copyTemplate = promisify(copy);
const mkdir = promisify(fs.mkdir);
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

const validTemplateName = /^[a-z\-0-9]+$/;
const templatePath = path.join(__dirname, 'meta-template');

async function promptQuestions() {
  return inquirer.prompt([
    {
      name: 'name',
      type: 'input',
      message: `What's the name of your template? This will be used as your template ID`,
      validate: (text) =>
        validTemplateName.test(text) ||
        'Your name can only contain lowercase characters, numbers and "-"',
    },
    {
      name: 'title',
      type: 'input',
      message: 'Enter a plain text title for the template',
      validate: (text) =>
        (text && text.length > 0 && text.length < 51) ||
        'Please specify a title no longer than 50 characters.',
    },
    {
      name: 'description',
      type: 'input',
      message: 'Describe what your template does',
      validate: (text) =>
        (text && text.length > 0) || 'Please specify a short description',
    },
  ]);
}

async function copyTemplateFiles(name, description, targetPath) {
  return copyTemplate(templatePath, targetPath, { name, description });
}

async function addToTemplatesJson(name, title, description) {
  const templatesJsonPath = path.resolve(__dirname, '../templates.json');
  const content = await readFile(templatesJsonPath, 'utf8');
  let json = {};
  try {
    json = JSON.parse(content);
  } catch (err) {
    throw new Error('Failed to read templates.json');
  }

  json.templates = [
    ...json.templates,
    {
      id: name,
      name: title,
      description,
    },
  ];

  const resultContent = JSON.stringify(json, null, 2);
  await writeFile(templatesJsonPath, resultContent, 'utf8');
}

async function run() {
  const { name, description, title, hasAssets } = await promptQuestions();

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
      task: () => copyTemplateFiles(name, description, targetPath),
    },
    {
      title: 'Adding template to templates.json',
      task: () => addToTemplatesJson(name, title, description),
    },
  ]);

  await tasks.run();

  const successMessage = `

${success} Template created

  You can find your template in the directory ${targetPath}.

  More information on how to modify and contribute your template can be found in the contributing docs:
  https://github.com/twilio-labs/function-templates/blob/master/docs/CONTRIBUTING.md
  `;

  console.warn(successMessage);
}

run().catch((err) => {
  if (err.code && err.code === 'EEXIST') {
    console.error(
      `${error} The name you specified already exists. Please pick a name that is not currently a directory name in this project`
    );
  } else {
    console.error(err.message);
  }
});
