#!/bin/zsh

APPLICATION_NAME='patient-appointment-management'

echo "APPLICATION_NAME=${APPLICATION_NAME}"
echo "tailing logs for flow.friendly_name=${APPLICATION_NAME} & service.unique_name=${APPLICATION_NAME}"

if [[ -z ${ACCOUNT_SID} ]]; then echo 'error: ACCOUNT_SID unset!'; exit 1; fi
if [[ -z ${AUTH_TOKEN} ]];  then echo 'error: AUTH_TOKEN unset!'; exit 1; fi

echo -n "SERVICE_SID: "
SERVICE_SID=$(curl https://serverless.twilio.com/v1/Services \
  --silent -u ${ACCOUNT_SID}:${AUTH_TOKEN} \
  | jq --raw-output '.services[] | select(.unique_name | contains("'${APPLICATION_NAME}'")) | .sid')
echo ${SERVICE_SID}
if [ -z ${SERVICE_SID} ]; then echo "error: not found service.unique_name=${APPLICATION_NAME}!"; exit 1; fi

echo -n "ENVIROMENT_SID: "
ENVIRONMENT_SID=$(curl https://serverless.twilio.com/v1/Services/${SERVICE_SID}/Environments \
  --silent -u ${ACCOUNT_SID}:${AUTH_TOKEN} \
  | jq --raw-output '.environments[0].sid')
echo ${ENVIRONMENT_SID}
if [ -z ${ENVIRONMENT_SID} ]; then echo "error: not found environment_sid for ${APPLICATION_NAME}!"; exit 1; fi

echo "twilio serverless:logs --environment=${ENVIRONMENT_SID} --service-sid=${SERVICE_SID} --tail"
twilio serverless:logs --environment=${ENVIRONMENT_SID} --service-sid=${SERVICE_SID} --tail
