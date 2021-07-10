#!/bin/zsh


APPLICATION_NAME="${PWD##*/}"

echo "APPLICATION_NAME=${APPLICATION_NAME}"

if [[ -z ${ACCOUNT_SID} ]]; then echo 'error: ACCOUNT_SID unset!'; exit 1; fi
if [[ -z ${AUTH_TOKEN} ]];  then echo 'error: AUTH_TOKEN unset!'; exit 1; fi

echo -n "TWILIO_SERVICE_SID: "
TWILIO_SERVICE_SID=$(curl https://serverless.twilio.com/v1/Services \
  --silent --user ${ACCOUNT_SID}:${AUTH_TOKEN} \
  | jq --raw-output '.services[] | select(.unique_name | contains("'${APPLICATION_NAME}'")) | .sid')
echo ${TWILIO_SERVICE_SID}
if [ -z ${TWILIO_SERVICE_SID} ]; then echo "error: not found service.unique_name=${APPLICATION_NAME}!"; exit 1; fi

echo "Updating service (${TWILIO_SERVICE_SID}) to be UIEditable"
curl -X POST "https://serverless.twilio.com/v1/Services/${TWILIO_SERVICE_SID}" \
--data-urlencode "UiEditable=True" \
--silent --user $ACCOUNT_SID:$AUTH_TOKEN | jq .
