#!/bin/sh
# Integration Tests for Echo Twimlet/Funlet
#
# Parameter:
#   $1 - URL of a deployed instance of the Echo Twimlet/Funlet
#
url="$1"

if test -z "$url"
then
  echo "Usage: $0 url" >&2
  echo "for example: $0 'https://twimlets.com/echo'"
  exit 1
fi

echo '[Echo-1] Successful Echo'
twiml='%3CResponse%3E%3CSay%3Eecho%20okay%3C%2FSay%3E%3C%2FResponse%3E'
curl -s "$url"?Twiml="$twiml" \
| xmllint --format -
