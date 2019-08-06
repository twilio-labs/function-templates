## Annotated Source Code

*based on a snapshot of Whisper TwiML source code (whisper.php)
sent to me by Twilio support by email on 2019-07-08*

This is PHP code.

```
<?php
```

It is shared by Twilio under the
[MIT license](https://opensource.org/licenses/MIT).

```
/*
Copyright (c) 2012 Twilio, Inc.

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.
*/
```

It uses the (deprecated) class
[Twilio\Twiml](https://www.twilio.com/docs/libraries/reference/twilio-php/5.34.1/class-Twilio.Twiml.html)
of the [twilio-php](https://github.com/twilio/twilio-php) helper library
to generate TwiML.

```
use Twilio\Twiml;
```

Start a new TwiML document.

```
// initiate response library
$response = new Twiml();
```

### Stage 2

```
// if we have a Digits= parameter, then this is the 2nd loop of this script
if (isset($_REQUEST['Digits'])) {

	// if a digit was pressed, then let us drop through
	if (!strlen($_REQUEST['Digits'])) {
```

This part seems unreachable: `<Gather/>` falls through to the rest of
the document without triggering the `action` URL when no digits have
been pressed:

> However, if the caller did not enter any digits or speech,
> call flow would continue in the original TwiML document.
> — https://www.twilio.com/docs/voice/twiml/gather#action

```
		// no digit was pressed, so just hangup
		$response->hangup();

	}

	// otherwise, we'll just return an empty document, which will bridge the calls
```

### Stage 1

```
} else {

	// no digits submitted, so this is the first run of the whisper file

	// grab the caller's phone number
	$from = strlen($_REQUEST['From']) ? $_REQUEST['From'] : $_REQUEST['Caller'];

	// add a Gather to get the digits when pressed
	$gather = $response->gather(array(
		'numDigits' => 1,
	));

	// figure out the message
	// first, check to see if we have an http URL (simple check)
	if (strtolower(substr(trim($_GET['Message']), 0, 4)) == 'http') {
		$gather->play($_GET['Message']);
	}

	// check if we have any message, if so, read it back
	elseif (strlen(trim($_GET['Message']))) {
		$gather->say(stripslashes($_GET['Message']));
	}

	// no message, just use a default
	else {
		$gather->say('You are receiving a call from ' . preg_replace('/([^\s])/', '$1. ', $from) . '.  Press any key to accept.');
	}

	// if we're screening to check for a person answering, hangup the call if gather falls through
	if (isset($_REQUEST['HumanCheck'])) {
		$response->hangup();
	}
}
```

Send the XML content-type header and the TwiML body.

```
// send response
if (!headers_sent()) {
	header('Content-type: text/xml');
}
echo $response;
```
