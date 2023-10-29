/*
 * These tests  verify that some important guarantees hold for all the functions
 * in the repository.
 */

const path = require('path');
const fs = require('fs');
const { parser } = require('configure-env');

/*
 * skipList is a list of function templates that don't pass verification
 * for now, but will in the long term
 */
const skipList = ['conversations', 'vaccine-standby'];
const incompleteTests = [
  'covid-vaccine-faq-bot',
  'patient-appointment-management',
  'sip-quickstart',
  'voicemail',
  'transfers',
  'list-numbers',
];
const excludedPaths =
  ['node_modules', 'test', 'coverage', 'docs', 'blank'] + skipList;
const projectRoot = path.resolve(__dirname, '..');
const templatesJson = path.join(projectRoot, 'templates.json');

/*
 * Assemble a list of template directories here, since templates.json
 * may not have all of them:
 */
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

fs.readFileSync(templatesJson);
const templatesJsonData = JSON.parse(fs.readFileSync(templatesJson));
const templatesMap = {};
for (const entry of templatesJsonData.templates) {
  templatesMap[entry.id] = entry;
}

describe('CI template verification', () => {
  // eslint-disable-next-line sonarjs/cognitive-complexity
  describe.each(templates)('the "%s" function template', (template) => {
    it('should have a populated functions directory', (done) => {
      const functionsDir = path.join(projectRoot, template, 'functions');

      fs.readdir(functionsDir, (err, files) => {
        expect(err).toBeFalsy();
        expect(files.length).toBeGreaterThan(0);
        done();
      });
    });

    it('should have a populated tests directory', (done) => {
      const functionsDir = path.join(projectRoot, template, 'tests');

      fs.readdir(functionsDir, (err, files) => {
        expect(err).toBeFalsy();
        expect(files.length).toBeGreaterThan(0);
        done();
      });
    });

    describe('its assets/index.html file', () => {
      const indexFile = path.join(
        projectRoot,
        template,
        'assets',
        'index.html'
      );

      it('should exist', (done) => {
        fs.access(indexFile, fs.constants.F_OK, (err) => {
          expect(err).toBeFalsy();
          done();
        });
      });

      it('should contain <!-- APP_INFO_V2 --> (for new-style index pages)', (done) => {
        fs.readFile(indexFile, (err, data) => {
          expect(err).toBeFalsy();
          if (data.includes('ce-paste-theme.css')) {
            expect(data.includes('<!-- APP_INFO_V2 -->'));
          }
          done();
        });
      });
    });

    describe('its .env.example (or .env) file and webhooks', () => {
      const envFile = () =>
        new Promise((resolve, reject) => {
          const envExamplePath = path.join(
            projectRoot,
            template,
            '.env.example'
          );
          fs.access(envExamplePath, fs.constants.F_OK, (err) => {
            if (err) {
              const envPath = path.join(projectRoot, template, '.env');
              fs.access(envPath, fs.constants.F_OK, (err) => {
                if (err) {
                  reject(new Error('cannot find a .env.example or .env file'));
                } else {
                  resolve(envPath);
                }
              });
            } else {
              resolve(envExamplePath);
            }
          });
        });

      it('should exist', async () => {
        await expect(envFile()).resolves.toBeTruthy();
      });

      it('should be parseable', async () => {
        const result = await parser.parseFile(await envFile());

        expect(result).toBeTruthy();
      });

      it('should have a description for each variable', async () => {
        const result = await parser.parseFile(await envFile());

        result.variables.forEach((v) => {
          if (!v.description) {
            throw new Error(`${v.key} is missing a description`);
          }
        });
      });

      it('should have non-configurable TWILIO_*_WEBHOOK_URL variables, if present', async () => {
        const result = await parser.parseFile(await envFile());
        const varRegex = /^TWILIO_.*_WEBHOOK_URL$/;

        result.variables
          .filter((v) => varRegex.test(v.key))
          .forEach((v) => {
            if (v.configurable) {
              throw new Error(`${v.key} should not be configurable`);
            }
          });
      });

      it('should have webhooks that exist with the correct visibility', async () => {
        const result = await parser.parseFile(await envFile());
        const varRegex = /^TWILIO_.*_WEBHOOK_URL$/;
        const excludedTemplates = ['hunt'];

        if (excludedTemplates.includes(template)) {
          return;
        }

        result.variables
          .filter((v) => varRegex.test(v.key))
          .forEach(async (v) => {
            const webhookFile = path.join(
              projectRoot,
              template,
              'functions',
              `${v.default}.protected.js`
            );
            const findProtected = new Promise((resolve, reject) => {
              fs.access(webhookFile, fs.constants.F_OK, (err) => {
                if (err) {
                  reject(
                    new Error(
                      `Expected the webhook ${v.default} for the template ${template} to exist with protected visibility`
                    )
                  );
                } else {
                  resolve();
                }
              });
            });

            await findProtected;
          });
      });
    });

    describe('its package.json file', () => {
      const packageJson = path.join(projectRoot, template, 'package.json');

      it('should exist', (done) => {
        fs.access(packageJson, fs.constants.F_OK, (err) => {
          expect(err).toBeFalsy();
          done();
        });
      });

      it('should be parseable as a Javascript object', (done) => {
        fs.readFile(packageJson, (err, contents) => {
          expect(err).toBeFalsy();
          const data = JSON.parse(contents);

          expect(data).toBeTruthy();
          expect(data.constructor).toBe(Object);
          done();
        });
      });
    });

    describe('its templates.json entry', () => {
      it('should exist and have all required fields', () => {
        if (!templatesMap[template]) {
          throw new Error(`${template} does not have a templates.json entry`);
        }
        const entry = templatesMap[template];

        if (!entry.name) {
          throw new Error(
            `${template} does not have a "name" field in templates.json`
          );
        } else if (!entry.description) {
          throw new Error(
            `${template} does not have a "description" field in templates.json`
          );
        }
      });
    });

    describe('its unit tests', () => {
      it('should have one per Function', (done) => {
        const functionsDir = path.join(projectRoot, template, 'functions');
        const testsDir = path.join(projectRoot, template, 'tests');
        const missingTests = [];

        if (incompleteTests.includes(template)) {
          done();
          return;
        }

        const functions = [];
        fs.readdir(functionsDir, (err, files) => {
          expect(err).toBeFalsy();
          fs.readdir(testsDir, (err, tests) => {
            expect(err).toBeFalsy();
            expect(testsDir.length).toBeGreaterThan(0);
            testsMap = {};
            for (const t of tests) {
              const testPathValue = path.basename(t);

              // it's a file
              if (testPathValue.includes('.')) {
                const testName = testPathValue.split('.')[0];
                functions.push(testName);

                testsMap[testName] = true;
              } else {
                // it's a sub-directory
                const testsSubDir = `${testsDir}/${testPathValue}`;
                const subDirTests = fs.readdirSync(testsSubDir);

                functions.push(...subDirTests);
                // eslint-disable-next-line no-loop-func
                subDirTests.forEach((test) => {
                  const testName = test.split('.')[0];
                  testsMap[testName] = true;
                });
              }
            }

            for (const f of functions) {
              const functionName = path.basename(f).split('.')[0];
              if (!testsMap[functionName]) {
                missingTests.push(functionName);
              }
            }

            if (missingTests.length > 0) {
              throw new Error(
                `The following Functions lack unit tests: ${missingTests.join(
                  ', '
                )}`
              );
            }

            done();
          });
        });
      });
    });
  });
});
