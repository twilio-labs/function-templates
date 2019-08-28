#!/bin/sh
# Integration Tests for Whisper Twimlet/Funlet
#
# Parameter:
#   $1 - URL of a deployed instance of the Whisper Twimlet/Funlet
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
  echo "for example: $0 'https://twimlets.com/whisper'"
  exit 1
fi

echo '[WHISPER-1-1] Recorded Message'
recordedMessage='https%3A%2F%2Fexample.com%2Frecorded-message.mp3'
query Message="$recordedMessage"
echo
echo '[WHISPER-1-2] Text Message'
textMessage='Text%20message'
query Message="$textMessage"
echo
echo '[WHISPER-1-3] Default Message'
from='%2B19165550123'
query Message= From="$from"
echo
echo '[WHISPER-1-4] Human Check'
query Message="$textMessage" HumanCheck=true
echo
echo '[WHISPER-2-1] A Digit was Pressed'
query Digits=5
echo
echo '[WHISPER-2-2] No Digits were Pressed'
query Digits=
