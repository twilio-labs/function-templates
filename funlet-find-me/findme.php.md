## Annotated Source Code

*based on a snapshot of Find Me TwiML source code (findme.php)
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

Make sure that `PhoneNumbers` is an array. Thanks to this code, if you
provide only one phone number, it is possible to omit the square brackets
from the parameter name and write just `PhoneNumbers=916-555-0123` instead
of `PhoneNumbers[]=916-555-0123`.

```
// init as array, if it's not
if (!is_array($_REQUEST['PhoneNumbers'])) {
	$_REQUEST['PhoneNumbers'] = array($_REQUEST['PhoneNumbers']);
}
```

Restrict the list to 10 non-empty phone numbers.

While writing the corresponding test case, I found a bug 🐞  in this code.
While it checks that no more than 10 numbers were given, it then keeps only
the numbers above the limit of 10. How is that possible? I checked the
documentation of the
[PHP function `array_splice`](https://www.php.net/manual/en/function.array-splice.php):

1. `array_splice(array, 10)` correctly removes all items
   starting from item 10 until the end of the array
2. but it changes the array itself
3. and it *returns the removed items*
4. which are here assigned back to the original array

As a result, only the removed items are preserved.

```
// remove empty entries from PhoneNumbers
$_REQUEST['PhoneNumbers'] = @array_filter($_REQUEST['PhoneNumbers']);

// verify no more than 10 numbers given
if (count($_REQUEST['PhoneNumbers']) > 10) {
	$_REQUEST['PhoneNumbers'] = array_splice($_REQUEST['PhoneNumbers'], 10);
}
```

### Stage 2

```
// if The Dial flag is present, it means we're returning from an attempted Dial
if (isset($_REQUEST['Dial']) && ($_REQUEST['DialStatus'] == 'answered' || $_REQUEST['DialCallStatus'] == 'completed')) {

	// answered call, so just hangup
	$response->hangup();
```

### Stage 1

```
} else {

	// No dial flag, or anything other than "answered", roll on to the next (or first, as it may be) number

	// get the next number of the array
	if (!$nextNumber = @array_shift($_REQUEST['PhoneNumbers'])) {

		// if no phone numbers left, redirect to the FailUrl

		// FailUrl found, so redirect and kill the cookie
		if (strlen($_REQUEST['FailUrl'])) {
			header('Location: ' .$_REQUEST['FailUrl']);
			die;
		} else {

			// no FailUrl found, so just end the call
			$response->hangup();

		}

	} else {

		// re-assemble remaining numbers into a QueryString, shifting the 0th off the array
		$qs = 'FailUrl=' . urlencode($_REQUEST['FailUrl']) . '&Timeout=' . urlencode($_REQUEST['Timeout']) . '&Message=' . urlencode($_REQUEST['Message']);
		foreach ($_REQUEST['PhoneNumbers'] as $number) {
			$qs .= '&PhoneNumbers%5B%5D=' . urlencode($number);
		}

		// add a dial to the response
		$dial = $response->dial(array(
			'action' => $_SERVER['SCRIPT_URL'] . '?Dial=true&' . $qs,
			'timeout' => $_REQUEST['Timeout'] ? $_REQUEST['Timeout'] : 60,
		));

		// add the number to dial
		$dial->number($nextNumber, array(
			'url' => 'whisper?Message=' . urlencode($_REQUEST['Message']) . '&HumanCheck=1',
		));

	}

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
