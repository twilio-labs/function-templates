/**
 *
 *  This Function shows you how to reach and utilise the temporary storage under the Function layer, mainly for single-invocation jobs
 *  For example, on each invocation we can create a file based on user data and use it accordingly
 *
 *  IMPORTANT: Do NOT treat this storage as long term storage or for personal data that need to persist.
 *  The contents get deleted whenever the associated container is brought down, so this function is useful for one time actions
 *
 *  Pre-requisites
 *  - You need to include the following npm modules: fs, path, os
 */
var fs = require('fs');
var path = require('path');
var os = require('os');

exports.handler = function(context, event, callback) {
    /*We create a text file and we put some data in it*/
    fs.writeFile(path.join(os.tmpdir(), 'test_file.txt'), 'Contents of created file in OS temp directory', function(err) {
        if (err) return callback(err);

        /*We read the contents of the temporary directory to check that the file was created. For multiple files you can create a loop*/
        fs.readdir(os.tmpdir(), function(err, files) {
            if (err) return callback(err);

            callback(null, "File created in temporary directory: " + files.join(", "));
        });
    });
};
