'use strict';

// This file contains Jest tests that run against every function template in
// the repo.

const path = require('path');
const fs = require('fs');

const excludedPaths = ['node_modules', 'test', 'coverage', 'docs'];
const projectRoot = path.resolve(__dirname, '..');
// Assemble a list of template directories here, since templates.json
// may not have all of them:
const templates = fs
      .readdirSync(projectRoot, { withFileTypes: true })
      .filter(
        (file) =>
        file.isDirectory() &&
          !file.name.startsWith('.') &&
          !file.name.startsWith('_') &&
          !excludedPaths.includes(file.name)
      )
      .map((dir) => dir.name);

describe.each(templates)('the "%s" function template', (template) => {
    it('should have a .env file', (done) => {
        const envFile = path.join(projectRoot, template, '.env');
        fs.access(envFile, fs.constants.F_OK, (err) => {
            expect(err).toBeFalsy();
            done();
        });
    });
});
