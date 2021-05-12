exports.handler = function(context, event, callback) {
    let response = new Twilio.Response();
    response.appendHeader("Access-Control-Allow-Origin", "*");
    response.appendHeader("Access-Control-Allow-Methods", "GET");
    response.appendHeader("Access-Control-Allow-Headers", "Content-Type");
    response.appendHeader('Content-Type', 'application/json');

    let body = {
        logoUrl: context.LOGO_URL,
        title: context.TITLE,
        description: context.DESCRIPTION,
        messageQuantity: context.MESSAGE_QUANTITY,
        messageInterval: context.MESSAGE_INTERVAL,
        buttonCta: context.BUTTON_CTA,
        optInKeyword: context.OPT_IN_KEYWORD,
        privacyPolicyLink: context.PRIVACY_POLICY_LINK,
        tosLink: context.TOS_LINK
    }

    response.setStatusCode(200);
    response.setBody(body);

    console.log(response);
    callback(null, response);
}