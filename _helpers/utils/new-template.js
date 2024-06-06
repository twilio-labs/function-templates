const inquirer = require('inquirer');
const Listr = require('listr');
const copy = require('copy-template-dir');
const { promisify } = require('util');
const path = require('path');
const fs = require('fs');
const { stat, readdir, copyFile, mkdir, rename } = require('fs/promises');
const { parser } = require('configure-env');
const { createOutput } = require('configure-env/dist/output');
const { stripIndents } = require('common-tags');

const copyTemplate = promisify(copy);
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

const validTemplateName = /^[a-z\-0-9]+$/;
const templatePath = path.join(__dirname, '..', 'meta-template');

async function getFilesRecursive(dir, baseDir = dir) {
  const dirents = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    dirents.map((dirent) => {
      const absolutePath = path.resolve(dir, dirent.name);
      const relativePath = path.relative(baseDir, absolutePath);
      const directoryPath = path.dirname(relativePath);
      return dirent.isDirectory()
        ? getFilesRecursive(absolutePath, baseDir)
        : { absolutePath, relativePath, directoryPath };
    })
  );
  return files.flat();
}

async function promptQuestions(additionalQuestions = []) {
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
    ...additionalQuestions,
  ]);
}

async function copyTemplateFiles(
  targetPath,
  { name, description, dependencies }
) {
  dependencies = dependencies || {
    '@twilio-labs/runtime-helpers': '^0.1.2',
  };
  const dependenciesAsString = JSON.stringify(dependencies, null, 4)
    .split('\n')
    .map((x) => (x.trim() === '}' ? '  }' : x))
    .join('\n');
  return copyTemplate(templatePath, targetPath, {
    name,
    description,
    dependencies: dependenciesAsString,
  });
}

async function addToTemplatesJson(name, title, description) {
  const templatesJsonPath = path.resolve(
    __dirname,
    '..',
    '..',
    'templates.json'
  );
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

async function addToPackageJson(name) {
  const packageJsonPath = path.resolve(__dirname, '..', '..', 'package.json');
  const content = await readFile(packageJsonPath, 'utf8');
  try {
    const packageJson = JSON.parse(content);
    packageJson.workspaces = [...packageJson.workspaces, name];
    const resultPackageJson = JSON.stringify(packageJson, null, 2);
    await writeFile(packageJsonPath, resultPackageJson, 'utf8');
  } catch (err) {
    throw new Error('Failed to update package.json');
  }
}

function createFileChecker(basePath) {
  return async function (relativePath, isDirectory = false) {
    const fullPath = path.resolve(basePath, relativePath);
    try {
      const statObject = await stat(fullPath);

      if (isDirectory) {
        return statObject.isDirectory();
      }

      return statObject.isFile();
    } catch (err) {
      return false;
    }
  };
}

async function isServerlessProject(projectPath) {
  const has = createFileChecker(projectPath);
  const hasPackageJson = await has('package.json');
  if (!hasPackageJson) {
    console.error('Could not find a package.json');
    return false;
  }

  const hasFunctions = await has('functions', true);
  if (!hasFunctions) {
    console.error('Could not find a functions/ directory');
    return false;
  }

  const hasAssets = await has('assets', true);
  if (!hasAssets) {
    console.error('Could not find an assets/ directory');
    return false;
  }

  return hasPackageJson && hasFunctions && hasAssets;
}

async function parseServerlessProject(projectPath) {
  const has = createFileChecker(projectPath);

  const packageJson = JSON.parse(
    await readFile(path.resolve(projectPath, 'package.json'), 'utf8')
  );
  const { dependencies } = packageJson;

  const hasEnvFile = await has('.env');

  const functions = await getFilesRecursive(
    path.resolve(projectPath, 'functions')
  );
  const assets = await getFilesRecursive(path.resolve(projectPath, 'assets'));

  return {
    dependencies,
    hasEnvFile,
    functions,
    assets,
  };
}

async function copyFunctionsAndAssets(targetDir, { functions, assets }) {
  const functionsDir = path.resolve(targetDir, 'functions');
  const assetsDir = path.resolve(targetDir, 'assets');

  const copyFunctions = functions.map(async (fn) => {
    const targetPath = path.resolve(functionsDir, fn.relativePath);
    const dirPath = path.resolve(functionsDir, fn.directoryPath);
    await mkdir(dirPath, { recursive: true });
    return copyFile(fn.absolutePath, targetPath);
  });

  const copyAssets = functions.map(async (fn) => {
    const targetPath = path.resolve(assetsDir, fn.relativePath);
    const dirPath = path.resolve(assetsDir, fn.directoryPath);
    await mkdir(dirPath, { recursive: true });
    return copyFile(fn.absolutePath, targetPath);
  });

  await Promise.all(copyFunctions);
  await Promise.all(copyAssets);
}

async function generateEnvExampleFromRealEnv(projectPath, targetPath) {
  const envFilePath = path.resolve(projectPath, '.env');
  const result = await parser.parseFile(envFilePath);
  result.variables = result.variables.map((variable) => {
    // overriding default and description to limit the risk of leaking content from real .env files
    return {
      ...variable,
      default: null,
      description: 'TODO',
    };
  });

  const outputEntries = result.variables
    .map((variable) => {
      return stripIndents`
      # description: ${variable.description}
      # format: ${variable.format}
      # required: ${variable.required}${
        variable.link ? `\n# link: ${variable.link}` : '' // eslint-disable-line sonarjs/no-nested-template-literals
      }${variable.configurable ? '' : '\n# configurable: false'}${
        variable.contentKey ? `\n# contentKey: ${variable.contentKey}` : '' // eslint-disable-line sonarjs/no-nested-template-literals
      }
      ${variable.key}=
    `;
    })
    .join('\n\n');

  await writeFile(
    path.resolve(targetPath, '.env.example'),
    outputEntries,
    'utf8'
  );
}

module.exports = {
  isServerlessProject,
  parseServerlessProject,
  promptQuestions,
  copyTemplateFiles,
  addToTemplatesJson,
  addToPackageJson,
  copyFunctionsAndAssets,
  generateEnvExampleFromRealEnv,
};
