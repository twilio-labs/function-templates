#!/bin/sh
# Integration Tests for Simple Message Twimlet/Funlet
#
# Parameter:
#   $1 - URL of a deployed instance of the Simple Message Twimlet/Funlet
#
# Uses:
#   * curl - transfer a URL
#   * xmllint - command line XML tool
#
url="$1"

indentXml(){
  xmllint --format -
}

# Function: query()
#
# Parameters:
#   $* - list of key or key=value HTTP parameters, properly URL-encoded
#
query(){
  # join parameters with '&'
  regularIFS="$IFS"
  IFS=\&
  params="$*"
  IFS="$regularIFS"

  curl -s "$url"?"$params" | indentXml
}

if test -z "$url"
then
  echo "Usage: $0 url" >&2
  echo "for example: $0 'https://twimlets.com/message'"
  exit 1
fi

echo '[SIMPLE-MESSAGE-0] No Message'
query
echo
echo '[SIMPLE-MESSAGE-1] Single Recorded Message'
recordedMessage='https%3A%2F%2Fexample.com%2Frecorded-message.mp3'
query Message="$recordedMessage"
echo
echo '[SIMPLE-MESSAGE-2] Single Text Message'
textMessage='Single%20message'
query Message="$textMessage"
echo
echo '[SIMPLE-MESSAGE-3] Multiple Messages'
message='Message%5B%5D'
message1='Message%20one'
message2='https%3A%2F%2Fexample.com%2Fmessage-two.mp3'
message3='Message%20three'
query "$message=$message1" "$message=$message2" "$message=$message3"
