## Annotated Source Code

*based on a snapshot of Voicemail TwiML source code (voicemail.php)
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

Define a black list with a single email. This will not be necessary
using Twilio Functions, which are bound to a specific Twilio account.

```
// Temporary Hack: FIX ME MONDAY
$emailBlacklist = array('[REDACTED]@yahoo.com');
```

Define a utility to format a phone number for display. Used in the email
which notifies that a voicemail has been recorded.

```
function PhoneFormat($no) {

	$no = Validation::StripNonNumeric($no);

	if (strlen($no) == 11 && substr($no, 0, 1) == '1') {
		$no = substr($no, 1);
	} elseif (strlen($no) == 12 && substr($no, 0, 2) == '+1') {
		$no = substr($no, 2);
	}

	if (strlen($no) == 10) {
		return '(' . substr($no, 0, 3) . ') ' . substr($no, 3, 3) . '-' . substr($no, 6);
	} elseif (strlen($no) == 7) {
		return substr($no, 0, 3) . '-' . substr($no, 3);
	} else {
		return $no;
	}

}
```

Start a new TwiML document.

```
// initiate response library
$response = new Twiml();
```

Define email headers. Used when the email is sent, with or without
a transcription.

```
// setup from email headers
$headers = 'From: voicemail@twimlets.com' . "\r\n" .
		   'Reply-To: voicemail@twimlets.com' . "\r\n" .
		   'X-Mailer: Twilio Twimlets';
```

Get the number of the caller and the recipient.
*Note: the number of the recipient is unused.*

```
// grab the to and from phone numbers
$from = strlen($_REQUEST['From']) ? $_REQUEST['From'] : $_REQUEST['Caller'];
$to = strlen($_REQUEST['To']) ? $_REQUEST['To'] : $_REQUEST['Called'];
```

### Stage 0: Black List

When the `Email` is found in the black list, just hang up.

```
if (in_array($_GET['Email'], $emailBlacklist)) {
	$response->hangup();
	if (!headers_sent()) {
		header('Content-type: text/xml');
	}
	echo $response;
	die;
}
```

### Stage 3

```
// check transcription response
if (strtolower($_REQUEST['TranscriptionStatus']) == 'completed') {

	// email message with the text of the transcription and a link to the audio recording
	$body = "You have a new voicemail from " . PhoneFormat($from) . "\n\n";
	$body .= "Text of the transcribed voicemail:\n{$_REQUEST['TranscriptionText']}.\n\n";
	$body .= "Click this link to listen to the message:\n{$_REQUEST['RecordingUrl']}.mp3";

	mail($_GET['Email'], "New Voicemail Message from " . PhoneFormat($from), $body, $headers);
	die;

} else if (strtolower($_REQUEST['TranscriptionStatus']) == 'failed') {

	// transcription failed so just email message with just a link to the audio recording
	$body = "You have a new voicemail from " . PhoneFormat($from) . "\n\n";
	$body .= "Click this link to listen to the message:\n{$_REQUEST['RecordingUrl']}.mp3";

	mail($_GET['Email'], "New Voicemail Message from " . PhoneFormat($from), $body, $headers);
	die;
```

### Stage 2

```
} else if (strlen($_REQUEST['RecordingUrl'])) {

	// returning from the Record so hangup
	$response->say('Thanks. Good bye.');
	$response->hangup();

	// not transcribing, email message with a link to the audio recording
	if (strlen($_GET['Transcribe']) && strtolower($_GET['Transcribe']) != 'true') {
		$body = "You have a new voicemail from " . PhoneFormat($from) . "\n\n";
		$body .= "Click this link to listen to the message:\n{$_REQUEST['RecordingUrl']}.mp3";

		mail($_GET['Email'], "New Voicemail Message from " . PhoneFormat($from), $body, $headers);
	}
```

### Stage 1

```
} else {

	// no message has been received, so play a VM greeting

	// figure out the message to say or play before the recording
	// first, check to see if we have an http URL (simple check)
	if (strtolower(substr(trim($_GET['Message']), 0, 4)) == 'http') {
		$response->play($_GET['Message']);
	}

	// check if we have any message, if so, read it back
	elseif (strlen(trim($_GET['Message']))) {
		$response->say(stripslashes($_GET['Message']));
	}

	// no message, just use a default
	else {
		$response->say('Please leave a message after the beep.');
	}

	// record with / without transcription
	if ((!strlen($_GET['Transcribe'])) || strtolower($_GET['Transcribe']) == 'true') {
		$params = array(
			'transcribe' => 'true',
			'transcribeCallback' => $_SERVER['SCRIPT_URI'] . '?Email=' . $_GET['Email'],
		);
	} else {
		$params = array();
	}

	// add record with the specified params
	$response->record($params);

}
```

Send the XML content-type header and the TwiML body.

```
// send the response
if (!headers_sent()) {
	header('Content-type: text/xml');
}
echo $response;
```
