exports.handler = function(context, event, callback) {
    let response = new Twilio.Response();
    response.appendHeader("Access-Control-Allow-Origin", "*");
    response.appendHeader("Access-Control-Allow-Methods", "GET");
    response.appendHeader("Access-Control-Allow-Headers", "Content-Type");
    response.appendHeader('Content-Type', 'application/json');

    let body = {
        title: context.TITLE,
        subtitle: context.SUBTITLE,
        description: context.DESCRIPTION,
        messagesPerMonth: context.MESSAGES_PER_MONTH,
        buttonCta: context.BUTTON_CTA,
        optInKeyword: context.OPT_IN_KEYWORD
    }

    response.setStatusCode(200);
    response.setBody(body);

    console.log(response);
    callback(null, response);
}