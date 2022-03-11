const fs = require('fs');
const { templates } = require('./templates.json');

console.log('Generating templates.md');

const docHeader = `## Available Functions

This is the list of Functions available in this repo:`;

const baseUrl = 'https://github.com/twilio-labs/function-templates/blob/main';
const templateLine = (id, name, description) => {
  return `* [${name}](${baseUrl}/${id}): ${description}`;
};

const templateList = templates.map(({ id, name, description }) =>
  templateLine(id, name, description)
);

const templateMarkdown = [docHeader, ...templateList].join('\n');

try {
  fs.writeFileSync('./docs/templates.md', templateMarkdown);
  console.log('file updated');
} catch (err) {
  console.error(err);
}
