## Annotated Source Code

*based on a snapshot of Call Me TwiML source code (callme.php)
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

### Stage 4

```
// if The Dial flag is present, it means we're returning from an attempted Dial
if (isset($_REQUEST['Dial']) && (strlen($_REQUEST['DialStatus']) || strlen($_REQUEST['DialCallStatus']))) {

	if ($_REQUEST['DialCallStatus'] == 'completed' || $_REQUEST['DialStatus'] == 'answered' || !strlen($_REQUEST['FailUrl'])) {

		// answered, or no failure url given, so just hangup
		$response->hangup();

	} else {

		// DialStatus was not answered, so redirect to FailUrl
		header('Location: ' . $_REQUEST['FailUrl']);
		die;

	}
```

### Stage 1

```
} else {

	// No dial flag, means it's our first run through the script

	// Add the FailUrl to the action param, if specified
	$failParam = '';
	if (isset($_REQUEST['FailUrl'])) {
		$failParam = '&FailUrl=' . urlencode($_REQUEST['FailUrl']);
	}

	// we made it to here, so just dial the number, with the optional Timeout given
	$dial = $response->dial(array(
		'action' => $_SERVER['SCRIPT_URL'] . '?Dial=true' . $failParam,
		'timeout' => $_REQUEST['Timeout'] ? $_REQUEST['Timeout'] : 20,
	));

	// add number attribute
	$dial->number($_GET['PhoneNumber'], array(
```

### Stage 2 and Stage 3: Whisper

Through the Whisper Twimlet, request the recipient to press a key to accept
the incoming call (stage 2), then bridge the call when a digit has been
pressed (stage 3). Note that the Whisper Twimlet requires an extra parameter
to be set, `HumanCheck=true`, to actually check that a digit has been pressed;
without this parameter, the call will be bridged whether the recipient pressed
a digit or not, possibly forwarding the call to a voicemail.

```
		'url' => 'whisper?Message=' . urlencode($_GET['Message']),
	));

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
