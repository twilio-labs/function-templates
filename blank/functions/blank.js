/*
 *[Comments intro section: replace or remove all bracketed text]
 * [Title of File]
 * Description: [Brief description of what file does]
 *
 * Contents:
 * [Insert Table of Contents (ToC) as a numbered list]
 * [List should correspond to the order and grouping of]
 * [code in the area below. It will include]
 * [#]. Main Handler
 * [at a minimum]
 * [END of intro section]
 */

/*
 *[Comments for each function should be placed above the functions]
 * [Explain the purpose of the function]
 * [Add JSDoc comments]
 */

/*
 *[Comment section for main handler]
 * [# in ToC.] Main Handler
 *
 * [Describe in detail what this handler will do. For example:]
 * ["This is the entry point to your Twilio Function,]
 * [which will create a new Voice Response using Twiml]
 * [and use this to dial the MY_PHONE_NUMBER ]
 * [specified in /.env]
 * [We then use the callback to return from your function]
 * [with the Twiml Voice Response you defined earlier.]
 * [In the callback in non-error situations, the first ]
 * [parameter is null and the second parameter ]
 * [is the value you want to return."]
 */

exports.handler = function (context, event, callback) {
  callback(null, {});
};
