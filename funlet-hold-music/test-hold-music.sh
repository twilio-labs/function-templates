#!/bin/sh
# Integration Tests for Hold Music Twimlet/Funlet
#
# Parameter:
#   $1 - URL of a deployed instance of the Hold Music Twimlet/Funlet
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
  echo "for example: $0 'https://twimlets.com/holdmusic'"
  exit 1
fi

echo '[HOLD-MUSIC-1] Missing Bucket'
query Bucket=
echo
echo '[HOLD-MUSIC-2] Bucket Not Found'
query Bucket=com.twilio.music.MISSING
echo
echo '[HOLD-MUSIC-3] No Songs Found in Bucket'
query Bucket=com.twilio.music.newage
echo
echo '[HOLD-MUSIC-4] Successful Hold Music (Without Message)'
query Bucket=com.twilio.music.guitars
echo
echo '[HOLD-MUSIC-5] Successful Hold Music With Message'
message='Please%20hold%20the%20line'
query Bucket=com.twilio.music.guitars Message="$message"
