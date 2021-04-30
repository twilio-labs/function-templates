'use strict';

// These tests  verify that some important guarantees hold for all the functions
// in the repository.

const path = require('path');
const fs = require('fs');
const { parser } = require('configure-env');

// skipList is a list of function templates that don't pass verification
// for now, but will in the long term
const skipList = ['conversations', 'funlet-find-me', 'funlet-simple-menu',
                  'funlet-simple-message', 'funlet-simulring',
                  'funlet-whisper', 'vaccine-standby'];
const excludedPaths = ['node_modules', 'test', 'coverage', 'docs', 'blank'] + skipList;
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

describe('CI template verification', () => {
    describe.each(templates)('the "%s" function template', (template) => {
        it('should have a populated functions directory', (done) => {
            const functionsDir = path.join(projectRoot, template,
                                           'functions');

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
            const indexFile = path.join(projectRoot, template,
                                        'assets', 'index.html');

            it('should exist', (done) => {
                fs.access(indexFile, fs.constants.F_OK, (err) => {
                    expect(err).toBeFalsy();
                    done();
                });
            });

            it('should contain <!-- APP_INFO_V2 --> (for new-style index pages)', (done) => {
                fs.readFile(indexFile, (err, data) => {
                    expect(err).toBeFalsy();
                    if(data.includes('ce-paste-theme.css')) {
                        expect(data.includes('<!-- APP_INFO_V2 -->'));
                    }
                    done();
                });
            });
        });

        describe('its .env file', () => {
            const envFile = path.join(projectRoot, template, '.env');

            it('should exist', (done) => {
                fs.access(envFile, fs.constants.F_OK, (err) => {
                    expect(err).toBeFalsy();
                    done();
                });
            });

            it('should be parseable', async () => {
                const result = await parser.parseFile(envFile);

                expect(result).toBeTruthy();
            });

            it('should have a description for each variable', async () => {
                const result = await parser.parseFile(envFile);

                result.variables.forEach((v) => {
                    if(!v.description) {
                        throw new Error(`${v.key} is missing a description`);
                    }
                });
            });

            it('should have non-configurable TWILIO_*_WEBHOOK_URL variables, if present', async () => {
                const result = await parser.parseFile(envFile);
                const varRegex = /^TWILIO_.*_WEBHOOK_URL$/;

                result.variables
                      .filter((v) => varRegex.test(v.key))
                      .forEach((v) => {
                          if(v.configurable) {
                              throw new Error(`${v.key} should not be configurable`);
                          }
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
    });
});
