#!/bin/sh
# Integration Tests for Forward Twimlet/Funlet
#
# Parameter:
#   $1 - URL of a deployed instance of the Forward Twimlet/Funlet
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
  echo "for example: $0 'https://twimlets.com/forward'"
  exit 1
fi

echo '[FORWARD-1-1] Successful Forward (from Example 1)'
phoneNumber=415-555-1212
query PhoneNumber="$phoneNumber"
echo
echo '[FORWARD-1-2] Successful Forward + Fallback URL (from Example 2)'
fallbackUrl='https%3A%2F%2Fexample.com%2Fplease-try-later.mp3'
query PhoneNumber="$phoneNumber" FailUrl="$fallbackUrl"
echo
echo '[FORWARD-1-3] Calling Number Allowed (from Example 3)'
allowed='AllowedCallers%5B%5D'
allowed1='650-555-1212'
allowed2='510-555-1212'
from2='5105551212'
query \
  PhoneNumber="$phoneNumber" \
  "$allowed"="$allowed1" \
  "$allowed"="$allowed2" \
  From="$from2"
echo
echo '[FORWARD-1-4] Calling Number Not Allowed (from Example 3)'
from3='9165550123'
query \
  PhoneNumber="$phoneNumber" \
  "$allowed"="$allowed1" \
  "$allowed"="$allowed2" \
  From="$from3"
echo
echo '[FORWARD-1-5] In API version "2008-08-01", convert AllowedCallers to local US number'
allowed2ext='%2B1-510-555-1212'
query \
  PhoneNumber="$phoneNumber" \
  "$allowed"="$allowed2ext" \
  ApiVersion=2008-08-01 \
  From="$from2"
echo
echo '[FORWARD-1-6] When recipient is an "allowed caller" (sic), not the caller'
query \
  PhoneNumber="$phoneNumber" \
  "$allowed"="$allowed2" \
  From="$from3" \
  To="$from2"
echo
echo '[FORWARD-1-7] Custom timeout and caller id'
query PhoneNumber="$phoneNumber" Timeout=42 CallerId="$allowed2"
echo
echo '[FORWARD-2-1] Call Completed'
query Dial=true DialCallStatus=completed FailUrl="$fallbackUrl"
echo
echo '[FORWARD-2-2] Call Answered'
query Dial=true DialStatus=answered FailUrl="$fallbackUrl"
echo
echo '[FORWARD-2-3] Failure with No Fallback URL'
query Dial=true DialCallStatus=busy
echo
echo '[FORWARD-2-4] Failure with Fallback URL'
showRedirect Dial=true DialCallStatus=busy FailUrl="$fallbackUrl"

