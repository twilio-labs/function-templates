'use strict';

const express = require('express');
const path = require('path');
const FileHound = require('filehound');

const app = express();
const port = 3002;

// Generate a list of function templates directories with static assets
const assetDirs = FileHound.create()
                       .paths(path.resolve(__dirname, '..'))
                       .directory()
                       .match('assets')
                       .depth(2)
                       .discard('node_modules', 'cypress')
                       .findSync();

assetDirs.forEach((assetDir) => {
    const template = path.basename(path.resolve(assetDir, '..'));

    app.use(`/${template}`, express.static(assetDir));
});


app.listen(port, () => {
    console.log(`Hosting all function templates at http://localhost:${port}`);
});
