#!/bin/sh
# Integration Tests for Call Me Twimlet/Funlet
#
# Parameter:
#   $1 - URL of a deployed instance of the Call Me Twimlet/Funlet
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
# If the `location` header is found, displays the redirect URL.
# Otherwise, display the output of the query, indented as XML,
# expecting to display a TwiML <Redirect/> instead.
showRedirect()
{
  joinParams "$@"
  response="$( curl -s -w 'Redirect: %{redirect_url}' "$url"?"$params" )"
  case "$response" in
    'Redirect: '*) echo "$response" ;;
    *) echo "$response" | sed 's/Redirect: $//' | indentXml
  esac
}

if test -z "$url"
then
  echo "Usage: $0 url" >&2
  echo "for example: $0 'https://twimlets.com/callme'"
  exit 1
fi

echo '[CALL-ME-1-1] Call Me with Phone Number Only (from Example 1)'
phoneNumber='415-555-1212'
query PhoneNumber="$phoneNumber"
echo
echo '[CALL-ME-1-2] Call Me with Phone Number and Fallback URL (from Example 2)'
fallbackUrl='https%3A%2F%2Fexample.com%2Fplease-try-later.mp3'
query PhoneNumber="$phoneNumber" FailUrl="$fallbackUrl"
echo
echo '[CALL-ME-1-3] Call Me with Custom Timeout and Message'
message='Custom%20message'
query PhoneNumber="$phoneNumber" Timeout=42 Message="$message"
echo
echo '[CALL-ME-2-1] Call Completed'
query Dial=true DialCallStatus=completed FailUrl="$fallbackUrl"
echo
echo '[CALL-ME-2-2] Call Answered'
query Dial=true DialStatus=answered FailUrl="$fallbackUrl"
echo
echo '[CALL-ME-2-3] Failure with No Fallback URL'
query Dial=true DialCallStatus=busy
echo
echo '[CALL-ME-2-4] Failure with Fallback URL'
showRedirect Dial=true DialCallStatus=busy FailUrl="$fallbackUrl"
