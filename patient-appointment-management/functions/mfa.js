/* eslint-disable prefer-destructuring, dot-notation */
exports.handler = function (context, event, callback) {
    const path = Runtime.getFunctions()['auth'].path;
    const { createAppToken, isValidMfaToken} = require(path);

    const ac = context.ACCOUNT_SID;

    var jwt = require('jsonwebtoken');

    const crypto = require('crypto');

    //assert(event.token, 'missing event.token');
    if (!isValidMfaToken(event.token, context)) {
        const response = new Twilio.Response();
        response.setStatusCode(401);
        response.appendHeader('Error-Message', 'Invalid or expired token. Please refresh the page and login again.');
        response.appendHeader('Content-Type', 'application/json');
        response.setBody({ message: 'Unauthorized' });

        return callback(null, response);
    }


    // encrypt the mfaCode to avoid showing in the browser
    mfaInputEncrypt= crypto
        .createHmac('sha256', context.AUTH_TOKEN)
        .update(Buffer.from(`${event.mfaCode}:${context.SALT}`, 'utf-8'))
        .digest('base64');

    mfaEncryptFromToken = jwt.verify(event.token, context.AUTH_TOKEN).data;
    console.log("mfaEncrypt ", mfaInputEncrypt, " : " , "mfaEncryptFromToken ", mfaEncryptFromToken)

    const response = new Twilio.Response();
    response.appendHeader('Content-Type', 'application/json');
    if(mfaInputEncrypt === mfaEncryptFromToken)
    {
        console.log(5);
        response.setBody({
            token: createAppToken("mfa",context)
        });
    }else{
        console.log(6);
        response.setStatusCode(401);
        response.appendHeader('Error-Message', 'Invalid code. Please check your phone and try again.');
    }
    console.log("came to mfa.js");
    callback(null, response);
};
