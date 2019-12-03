#!/bin/sh
# Integration Tests for Find Me Twimlet/Funlet
#
# Parameter:
#   $1 - URL of a deployed instance of the Find Me Twimlet/Funlet
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
  echo "for example: $0 'https://twimlets.com/findme'"
  exit 1
fi

echo '[FIND-ME-1-1] Find Me with 3 Numbers (from Example 1)'
phoneNumber1='PhoneNumbers%5B0%5D'
phoneNumber2='PhoneNumbers%5B1%5D'
phoneNumber3='PhoneNumbers%5B2%5D'
number1='415-555-1212'
number2='415-555-1313'
number3='415-555-1414'
query \
  "$phoneNumber1"="$number1" \
  "$phoneNumber2"="$number2" \
  "$phoneNumber3"="$number3"
echo
echo '[FIND-ME-1-2] Find Me with 3 Numbers and Fallback URL (from Example 2)'
phoneNumber='PhoneNumbers%5B%5D'
fallbackUrl='https%3A%2F%2Fexample.com%2Fplease-try-later.mp3'
query \
  "$phoneNumber"="$number1" \
  "$phoneNumber"="$number2" \
  "$phoneNumber"="$number3" \
  FailUrl="$fallbackUrl"
echo
echo '[FIND-ME-1-3] Find Me with Custom Timeout and Message'
message='Custom%20message'
query \
  "$phoneNumber"="$number1" \
  "$phoneNumber"="$number2" \
  "$phoneNumber"="$number3" \
  Timeout=42 \
  Message="$message"
echo
echo '[FIND-ME-1-4] Allow up to 10 numbers'
number1='415-555-1001'
number2='415-555-1002'
number3='415-555-1003'
number4='415-555-1004'
number5='415-555-1005'
number6='415-555-1006'
number7='415-555-1007'
number8='415-555-1008'
number9='415-555-1009'
number10='415-555-1010'
query \
  "$phoneNumber"="$number1" \
  "$phoneNumber"="$number2" \
  "$phoneNumber"="$number3" \
  "$phoneNumber"="$number4" \
  "$phoneNumber"="$number5" \
  "$phoneNumber"="$number6" \
  "$phoneNumber"="$number7" \
  "$phoneNumber"="$number8" \
  "$phoneNumber"="$number9" \
  "$phoneNumber"="$number10"
echo
echo '[FIND-ME-1-5] Discard Extra Numbers Above 10'
number11='415-555-1011'
number12='415-555-1012'
query \
  "$phoneNumber"="$number1" \
  "$phoneNumber"="$number2" \
  "$phoneNumber"="$number3" \
  "$phoneNumber"="$number4" \
  "$phoneNumber"="$number5" \
  "$phoneNumber"="$number6" \
  "$phoneNumber"="$number7" \
  "$phoneNumber"="$number8" \
  "$phoneNumber"="$number9" \
  "$phoneNumber"="$number10" \
  "$phoneNumber"="$number11" \
  "$phoneNumber"="$number12"
echo
echo '[FIND-ME-1-6] No More Numbers, Without Fallback URL'
query
echo
echo '[FIND-ME-1-7] No More Numbers, With Fallback URL'
showRedirect FailUrl="$fallbackUrl"
echo
echo '[FIND-ME-4-1] Call Answered'
query Dial=true DialStatus=answered
echo
echo '[FIND-ME-4-2] Call Completed'
query Dial=true DialCallStatus=completed
