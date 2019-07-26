#!/bin/sh
# Integration Tests for Simple Menu Twimlet/Funlet
#
# Parameter:
#   $1 - URL of a deployed instance of the Simple Menu Twimlet/Funlet
#
# Uses:
#   * curl - transfer a URL
#   * xmllint - command line XML tool
#
url="$1"

indentXml(){
  xmllint --format -
}

# Join HTTP parameters with '&'
# and save them into $params.
joinParams(){
  regularIFS="$IFS"
  IFS=\&
  params="$*"
  IFS="$regularIFS"
}

# Function: query()
# Query the Twimlet/Funlet using given HTTP parameters
#
# Parameters:
#   $* - list of key or key=value HTTP parameters, properly URL-encoded
#
query(){
  joinParams "$@"
  curl -s "$url"?"$params" | indentXml
}

# Function: showRedirect()
# Alternative to query() for use when a redirect is expected instead of TwiML.
# Displays the status code and the `location` header with the target URL.
showRedirect()
{
  joinParams "$@"
  curl -I -s "$url"?"$params" | grep '^HTTP\|^location'
}

if test -z "$url"
then
  echo "Usage: $0 url" >&2
  echo "for example: $0 'https://twimlets.com/menu'"
  exit 1
fi

echo '[SIMPLE-MENU-1-1] Recorded Message'
recordedMessage='https%3A%2F%2Fexample.com%2Frecorded-message.mp3'
query Message="$recordedMessage"
echo
echo '[SIMPLE-MENU-1-2] Text Message'
textMessage='Text%20message'
query Message="$textMessage"
echo
echo '[SIMPLE-MENU-1-3] Multiple Digits to Gather'
option12345='Options%5B12345%5D'
action12345='https%3A%2F%2Fexample.com%2F12345'
query Message="$textMessage" "$option12345"="$action12345"
echo
echo '[SIMPLE-MENU-2-1] Digits Pressed Match an Option'
showRedirect Digits=12345 "$option12345"="$action12345"
echo
echo '[SIMPLE-MENU-2-2] Digits Pressed Do Not Match Any Option'
query Digits=42
