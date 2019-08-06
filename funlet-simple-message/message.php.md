## Annotated Source Code

*based on a snapshot of Simple Message TwiML source code (message.php)
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
[Twilio\Twiml](https://www.twilio.com/docs/libraries/reference/twilio-php/5.34.1/class-Twilio.Twiml.html) of the [twilio-php](https://github.com/twilio/twilio-php)
helper library to generate TwiML.

```
use Twilio\Twiml;
```

Start a new TwiML document.

```
// initiate response library
$response = new Twiml();
```

Make sure that `Message` is an array. Thanks to this code,
if you set only one message, it is possible to omit the square
brackets from the parameter name and write just `Message=one`
instead of `Message[]=one`.

```
// create an array of messages if not already
if (!is_array($_GET['Message'])) {
	$_GET['Message'] = array($_GET['Message']);
}
```

### Stage 1

```
// foreach message, output it
foreach ($_GET['Message'] as $msg) {

	// figure out the message
	// first, check to see if we have an http URL (simple check)
	if (strtolower(substr(trim($msg), 0, 4)) == 'http') {
		$response->play($msg);
	}

	// check if we have any message, if so, read it back
	elseif (strlen(trim($msg))) {
		$response->say(stripslashes($msg));
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
