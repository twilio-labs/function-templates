const crypto = require("crypto");
const path = require("path");
const SALT = 'salty'

exports.handler = function (context, event, callback) {
    // Create a token from the password, and use it to check by setting it
    console.log(event.password);
    function createToken(context, password) {
        const tokenString = `${context.ACCOUNT_SID}:${password}:${SALT}`;

        // Similar to TwilioClient
        return crypto
            .createHmac("sha1", context.AUTH_TOKEN)
            .update(Buffer.from(tokenString, "utf-8"))
            .digest("base64");
    }

    function isAllowed(token) {
        // Create the token with the environment password
        const masterToken = createToken(context, process.env.ADMIN_PASSWORD);
        return masterToken === token;
    }

    const token = createToken(context, event.password);
    // Short-circuits
    if (isAllowed(token)) {
        return callback(null, { token });
    }
};