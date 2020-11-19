'use strict';

const express = require('express');
const path = require('path');

const app = express();
const port = 3002;

// The list of templates with Cypress tests
const templates = ['verify'];

templates.forEach((template) => {
    app.use(`/${template}`, express.static(path.resolve(__dirname, '..', template, 'assets')));
});

app.listen(port, () => {
    console.log(`Hosting all function templates at http://localhost:${port}`);
});
