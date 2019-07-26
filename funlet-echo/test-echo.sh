#!/bin/sh
# Integration Tests for Echo Twimlet/Funlet
#
# Parameter:
#   $1 - URL of a deployed instance of the Echo Twimlet/Funlet
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
  echo "for example: $0 'https://twimlets.com/echo'"
  exit 1
fi

echo '[Echo-1] Successful Echo'
twiml='%3CResponse%3E%3CSay%3Eecho%20okay%3C%2FSay%3E%3C%2FResponse%3E'
query Twiml="$twiml"
