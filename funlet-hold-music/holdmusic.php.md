## Annotated Source Code

*based on a snapshot of Hold Music TwiML source code (holdmusic.php)
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

It defines the utility function `endsWith` to check whether a substring
is found at the end of a string. This utility will be used to look for
specific file extensions to identify which of the URLs in the S3 bucket
correspond to songs.

```
function endsWith($str, $sub) {
	return (substr($str, strlen($str) - strlen($sub)) == $sub);
}
```

Start a new TwiML document.

```
// initiate response library
$response = new Twiml();
```

### Step 1

```
// require an S3 bucket
if (!strlen($_GET['Bucket'] = trim($_GET['Bucket']))) {
	$response->say('An S 3 bucket is required.');
	if (!headers_sent()) {
		header('Content-type: text/xml');
	}
	echo $response;
	die;
}
```

### Step 2

```
// use Curl to get the contents of the bucket
$ch = curl_init();
curl_setopt($ch, CURLOPT_TIMEOUT, 5);
curl_setopt($ch, CURLOPT_URL, 'http://' . $_GET['Bucket'] . '.s3.amazonaws.com');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

// do the fetch
if (!$output = curl_exec($ch)) {
	$response->say('Failed to fetch the hold music.');
	if (!headers_sent()) {
		header('Content-type: text/xml');
	}
	echo $response;
	die;
}
```

### Step 3

```
// parse as XML
$xml = new SimpleXMLElement($output);

// construct an array of URLs
$urls = array();
foreach ($xml->Contents as $c) {
	// add any mp3, wav or ul to the urls array
	if ((endsWith($c->Key, '.mp3')) || (endsWith($c->Key, '.wav')) || (endsWith($c->Key, '.ul'))) {
		$urls[] = $c->Key;
	}
}

// if no songs where found, then bail
if (!count($urls)) {
	$response->say('Failed to fetch the hold music.');
	if (!headers_sent()) {
		header('Content-type: text/xml');
	}
	echo $response;
	die;
}
```

### Step 4

```
// and let's shuffle
shuffle($urls);

// Play each URL
foreach ($urls as $url) {

	// Play each url
	$response->play('http://' . $_GET['Bucket'] . '.s3.amazonaws.com/' . urlencode($url));

	// if a message was given, then output it between music
	// first, check to see if we have an http URL (simple check)
	if (strtolower(substr(trim($_GET['Message']), 0, 4)) == 'http') {
		$response->play($_GET['Message']);
	}

	// read back the message given
	elseif (strlen($_GET['Message'])) {
		$response->say(stripslashes($_GET['Message']));
	}

}

// and loop
$response->redirect();
```

Send the XML content-type header and the TwiML body.

```
// send response
if (!headers_sent()) {
	header('Content-type: text/xml');
}
echo $response;
```
