## Annotated Source Code

*based on a snapshot of Echo TwiML source code (echo.php)
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

Send Content-Type header for an XML document (TwiML is XML).

```
// send XML header
header('Content-type: text/xml');
```

Send the contents of the `Twiml` parameter as response.

```
// echo the TwiML passed into the URL
echo $_GET['Twiml'];
```

(there is no check that we received valid TwiML at this point,
invalid TwiML will fail further in the flow)
