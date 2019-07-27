#!/bin/sh
# Integration Tests for Conference Twimlet/Funlet
#
# Parameter:
#   $1 - URL of a deployed instance of the Conference Twimlet/Funlet
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
  echo "for example: $0 'https://twimlets.com/conference'"
  exit 1
fi

echo '[CONFERENCE-1-1] Request Password: No Password Provided'
query Password=1234
echo
echo '[CONFERENCE-1-2] Request Password: Wrong Password Provided'
query Password=1234 Digits=0000
echo
echo '[CONFERENCE-2-1] Correct Password'
query Password=1234 Digits=1234
echo
echo '[CONFERENCE-2-2] Named Conference (from example 1)'
query Name=foo
echo
echo '[CONFERENCE-2-3] Text Message'
message='Custom%20message'
query Name=foo Message="$message"
echo
echo '[CONFERENCE-2-4] Recorded Message'
recordedMessage='https%3A%2F%2Fexample.com%2Frecorded-message.mp3'
query Name=foo Message="$recordedMessage"
echo
echo '[CONFERENCE-2-5] Hold Music from Twilio Genres (from example 3)'
query Music=rock
echo
echo '[CONFERENCE-2-6] Hold Music from a TwiML Script'
twimlUrl='https%3A%2F%2Ftwimlets.com%2Fholdmusic%3FBucket%3Dcom.twilio.music.soft-rock'
query Music="$twimlUrl"
echo
echo '[CONFERENCE-2-7] Hold Music from a Music File'
musicUrl='https%3A%2F%2Fexample.com%2Fhold-music.mp3'
query Music="$musicUrl"
echo
echo '[CONFERENCE-2-8] Two Moderators (from example 2)'
moderator='Moderators%5B%5D'
number1='415-555-1212'
number2='555-867-5309'
query "$moderator"="$number1" "$moderator"="$number2"
echo
echo 'CONFERENCE-2-9] SMS Notifications for Two Moderators'
number3='916-555-0123'
query \
  "$moderator"="$number1" \
  "$moderator"="$number2" \
  Caller="$number3" \
  EnableSmsNotifications=true
echo
echo '[CONFERENCE-2-10] One of the Two Moderators Calls'
from1='%2B1-415-555-1212'
query From="$from1" "$moderator"="$number1" "$moderator"="$number2"
echo
echo '[CONFERENCE-2-11] When the Conference Number is a Moderator'
to2='%2B1-555-867-5309'
query To="$to2" "$moderator"="$number1" "$moderator"="$number2"
