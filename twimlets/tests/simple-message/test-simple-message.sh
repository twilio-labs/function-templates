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
echo
echo '[SIMPLE-MESSAGE-4] Play a greeting then say some text (Example 1)'
key0='Message%5B0%5D'
key1='Message%5B1%5D'
value0='http%3A%2F%2Fmyserver.com%2Fhello.mp3'
value1='Thank+You+For+Calling'
query "$key0=$value0" "$key1=$value1"
echo
echo '[SIMPLE-MESSAGE-5] Play two greetings then say two text blurbs (Example 2)'
key0='Message%5B0%5D'
key1='Message%5B1%5D'
key2='Message%5B2%5D'
key3='Message%5B3%5D'
value0='http%3A%2F%2Fmyserver.com%2F1.mp3'
value1='http%3A%2F%2Fmyserver.com%2F2.mp3'
value2='I+Just+Played+A+File'
value3='I+Just+Said+Some+Text'
query "$key0=$value0" "$key1=$value1" "$key2=$value2" "$key3=$value3"
