#!/bin/zsh

APPLICATION_NAME='patient-appointment-management'

echo "APPLICATION_NAME=${APPLICATION_NAME}"
echo "tailing logs for flow.friendly_name=${APPLICATION_NAME} & service.unique_name=${APPLICATION_NAME}"

if [[ -z ${ACCOUNT_SID} ]]; then echo 'error: ACCOUNT_SID unset!'; exit 1; fi
if [[ -z ${AUTH_TOKEN} ]];  then echo 'error: AUTH_TOKEN unset!'; exit 1; fi

echo -n "TWILIO_SERVICE_SID: "
TWILIO_SERVICE_SID=$(curl https://serverless.twilio.com/v1/Services \
  --silent -u ${ACCOUNT_SID}:${AUTH_TOKEN} \
  | jq --raw-output '.services[] | select(.unique_name | contains("'${APPLICATION_NAME}'")) | .sid')
echo ${TWILIO_SERVICE_SID}
if [ -z ${TWILIO_SERVICE_SID} ]; then echo "error: not found service.unique_name=${APPLICATION_NAME}!"; exit 1; fi

echo -n "ENVIROMENT_SID: "
TWILIO_ENVIRONMENT_SID=$(curl https://serverless.twilio.com/v1/Services/${TWILIO_SERVICE_SID}/Environments \
  --silent -u ${ACCOUNT_SID}:${AUTH_TOKEN} \
  | jq --raw-output '.environments[0].sid')
echo ${TWILIO_ENVIRONMENT_SID}
if [ -z ${TWILIO_ENVIRONMENT_SID} ]; then echo "error: not found environment_sid for ${APPLICATION_NAME}!"; exit 1; fi

echo "twilio serverless:logs --environment=${TWILIO_ENVIRONMENT_SID} --service-sid=${TWILIO_SERVICE_SID} --tail"
twilio serverless:logs --environment=${TWILIO_ENVIRONMENT_SID} --service-sid=${TWILIO_SERVICE_SID} --tail
