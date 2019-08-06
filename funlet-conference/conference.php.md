## Annotated Source Code

*based on a snapshot of Conference TwiML source code (conference.php)
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

Get the phone numbers of the caller and recipient.

```
// grab the to and from phone numbers
$from = strlen($_REQUEST['From']) ? $_REQUEST['From'] : $_REQUEST['Caller'];
$to = strlen($_REQUEST['To']) ? $_REQUEST['To'] : $_REQUEST['Called'];
```

### Stage 1

```
// if password is set, then ask for it
if (strlen($_GET['Password']) && $_REQUEST['Digits'] != $_GET['Password']) {
	// gather just enough digits, but a min of 3 for security
	$gather = $response->gather(array(
		'numDigits' => max(3, strlen($_GET['Password'])),
	));
	$gather->say('Please enter your conference pass code');
	$response->redirect();
	if (!headers_sent()) {
		header('Content-type: text/xml');
	}
	echo $response;
	die;
}
```

### Stage 2

```
// if an array of Moderator phone numbers is provided, determine if we're the moderator
if (is_array($_GET['Moderators'])) {

	// normalize all numbers, removing any non-digits
	foreach ($_GET['Moderators'] as &$phone) {
		$phone = preg_replace('/[^0-9]/', '', $phone);
		// remove leading 1 if US
		if (strlen($phone) == 11 && substr($phone, 0, 1) == '1') {
			$phone = substr($phone, 1);
		}
	}

	//normalize the from number
	$from = preg_replace('/[^0-9]/', '', $from);
	if (strlen($from) == 11 && substr($from, 0, 1) == '1') {
		$from = substr($from, 1);
	}

	//normalize the to number
	$to = preg_replace('/[^0-9]/', '', $to);
	if (strlen($to) == 11 && substr($to, 0, 1) == '1') {
		$to = substr($to, 1);
	}

	// figure out if we're a moderator or not
	$isModerator = (in_array($from, $_GET['Moderators']) || in_array($to, $_GET['Moderators']));

} else
	// no moderators given, so just do a normal conference w/o a moderator
	$isModerator = null;

// if Caller is not a moderator, and SMS notifications are turned on, send SMS to the moderator numbers
if ((!$isModerator) && is_array($_GET['Moderators']) && $_GET['EnableSmsNotifications']) {
	foreach ($_GET['Moderators'] as $moderator) {
		$response->message($_REQUEST['Caller'] . ' has entered your conference.  Call the number this text came from to join.', array('to' => $moderator));
	}
}

// if a message has been given, then play it
// first, check to see if we have an http URL (simple check)
if (strtolower(substr(trim($_GET['Message']), 0, 4)) == 'http') {
	$response->play($_GET['Message']);
}

// read back the message given
elseif (strlen($_GET['Message'])) {
	$response->say(stripslashes($_GET['Message']));
}

// read default message
else {
	$response->say('You are now entering the conference line.');
}

// If a Conference Name was not provided, then make a unique string based on the parameters (Moderators, Message) of this conference
// Not fool proof, but good for most purposes
if (!strlen($_GET['Name'])) {
	// create a hash of Message + Moderators
	$hashme = $_GET['Message'];
	if (is_array($_GET['Moderators'])) {
		foreach ($_GET['Moderators'] as $m) {
			$hashme .= "$m";
		}
	}
	$_GET['Name'] = md5($hashme);
}

// init params for Conference
$params = array();

// validate genre, and construct a twimlet url for the music from the given genre
switch ($_GET['Music']) {
	case 'classical':
	case 'ambient':
	case 'electronica':
	case 'guitars':
	case 'rock':
	case 'soft-rock':
		$params['waitUrl'] = 'http://twimlets.com/holdmusic?Bucket=com.twilio.music.' . $_GET['Music'];
		$params['waitMethod'] = 'GET';
		break;
	default:
		if (strtolower(substr($_GET['Music'], 0, 4)) == 'http') {
			$params['waitUrl'] = $_GET['Music'];
			$params['waitMethod'] = 'GET';
		}
		break;

}

// add moderator if given
if (!is_null($isModerator)) {
	$params['startConferenceOnEnter'] = $isModerator ? 'true' : 'false';
}

// add a Dial which will encapsulate the conference we're dialing
$dial = $response->dial();

// add the conference noun to the dial
$dial->conference($_GET['Name'], $params);
```

Send the XML content-type header and the TwiML body.

```
// flush out response
if (!headers_sent()) {
	header('Content-type: text/xml');
}
echo $response;
```
