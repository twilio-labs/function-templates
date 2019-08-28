#!/bin/sh
# Integration Tests for Voicemail Twimlet/Funlet
#
# Parameter:
#   $1 - URL of a deployed instance of the Voicemail Twimlet/Funlet
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

# Function: showStatusCode()
# Alternative to query() for use when an empty response body is expected.
# Displays just the status code of the response.
showStatusCode()
{
  joinParams "$@"
  curl -I -s "$url"?"$params" | grep '^HTTP'
}

if test -z "$url"
then
  echo "Usage: $0 url" >&2
  echo "for example: $0 'https://twimlets.com/voicemail'"
  exit 1
fi

echo '[VOICEMAIL-1-1] Voicemail with Default Message'
email='you%40example.com'
query Email="$email" Transcribe=false
echo
echo '[VOICEMAIL-1-2] Voicemail with Custom Text Message'
message='Custom%20message'
query Email="$email" Message="$message" Transcribe=false
echo
echo '[VOICEMAIL-1-3] Voicemail with Recorded Message'
recordedMessage='https%3A%2F%2Fexample.com%2Frecorded-message.mp3'
query Email="$email" Message="$recordedMessage" Transcribe=false
echo
echo '[VOICEMAIL-1-4] Voicemail with Text Transcription'
query Email="$email"
echo
echo '[VOICEMAIL-2-1] Recording Callback Without Transcription'
recordingUrl='https%3A%2F%2Ftwilio.example.com%2Fvoicemail-recording'
from='%2B1-916-555-0123'
query RecordingUrl="$recordingUrl" From="$from" Email="$email" Transcribe=false
echo
echo '[VOICEMAIL-2-2] Recording Callback With Transcription'
query RecordingUrl="$recordingUrl" Email="$email" Transcribe=true
echo
echo '[VOICEMAIL-3-1] Transcription Successful'
transcriptionText='Call%20me'
showStatusCode \
  TranscriptionStatus=completed \
  TranscriptionText="$transcriptionText" \
  RecordingUrl="$recordingUrl" \
  From="$from" \
  Email="$email"
echo
echo '[VOICEMAIL-3-2] Transcription Failed'
showStatusCode \
  TranscriptionStatus=failed \
  RecordingUrl="$recordingUrl" \
  From="$from" \
  Email="$email"
