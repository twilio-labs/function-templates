#!/bin/sh
# Integration Tests for Simulring Twimlet/Funlet
#
# Parameter:
#   $1 - URL of a deployed instance of the Simulring Twimlet/Funlet
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
  echo "for example: $0 'https://twimlets.com/simulring'"
  exit 1
fi

echo '[SIMULRING-1-1] Simulring with 3 Phone Numbers (from example 1)'
phoneNumber='PhoneNumbers%5B%5D'
phoneNumber1='415-555-1212'
phoneNumber2='415-555-1313'
phoneNumber3='415-555-1414'
query \
  "$phoneNumber"="$phoneNumber1" \
  "$phoneNumber"="$phoneNumber2" \
  "$phoneNumber"="$phoneNumber3"
echo
echo '[SIMULRING-1-2] Simulring with 3 Phone Numbers and Fallback URL (from example 2)'
fallbackUrl='https%3A%2F%2Fexample.com%2Fplease-try-later.mp3'
query \
  "$phoneNumber"="$phoneNumber1" \
  "$phoneNumber"="$phoneNumber2" \
  "$phoneNumber"="$phoneNumber3" \
  FailUrl="$fallbackUrl"
echo
echo '[SIMULRING-1-3] Simulring with Custom Timeout and Message'
message='Custom%20message'
query \
  "$phoneNumber"="$phoneNumber1" \
  "$phoneNumber"="$phoneNumber2" \
  "$phoneNumber"="$phoneNumber3" \
  FailUrl="$fallbackUrl" \
  Timeout=42 \
  Message="$message"
echo
echo '[SIMULRING-2-1] Call Completed'
query Dial=true DialCallStatus=completed FailUrl="$fallbackUrl"
echo
echo '[SIMULRING-2-2] Call Answered'
query Dial=true DialStatus=answered FailUrl="$fallbackUrl"
echo
echo '[SIMULRING-2-3] Failure with No Fallback URL'
query Dial=true DialCallStatus=busy
echo
echo '[SIMULRING-2-4] Failure with Fallback URL'
showRedirect Dial=true DialCallStatus=busy FailUrl="$fallbackUrl"
