#!/bin/zsh
set -e

APPLICATION_NAME="patient-appointment-management"
CUSTOMER_NAME="Owl Health"

if [[ -z ${ACCOUNT_SID} ]]; then echo 'ACCOUNT_SID unset!'; exit 1; fi
if [[ -z ${AUTH_TOKEN} ]];  then echo 'AUTH_TOKEN unset!'; exit 1; fi
AUTHENTICATION="${ACCOUNT_SID}:${AUTH_TOKEN}"

# ---------- retrieve service sid
SERVICE_UNIQUE_NAME=${APPLICATION_NAME}
SERVICE_SID=$(curl "https://serverless.twilio.com/v1/Services" --silent --user ${AUTHENTICATION} \
  | jq --raw-output '.services[] | select(.unique_name | contains("'${SERVICE_UNIQUE_NAME}'")) | .sid')
if [[ -z ${SERVICE_SID} ]]; then
  echo "unable to find flow.unique_name=${SERVICE_UNIQUE_NAME} in your services! exiting ..."
  exit 1
fi
echo "SERVICE_SID=${SERVICE_SID}"

# ---------- retrieve service environment, should only be one
ENVIRONMENT_SID=$(curl "https://serverless.twilio.com/v1/Services/${SERVICE_SID}/Environments" --silent --user ${AUTHENTICATION} \
  | jq --raw-output '.environments[0].sid')
if [[ -z ${ENVIRONMENT_SID} ]]; then
  echo "found no environment for service.unique_name=${SERVICE_UNIQUE_NAME}! exiting ..."
  exit 1
fi
echo "ENVIRONMENT_SID=${ENVIRONMENT_SID}"

ENVIRONMENT_NAME=$(curl "https://serverless.twilio.com/v1/Services/${SERVICE_SID}/Environments" --silent --user ${AUTHENTICATION} \
  | jq --raw-output '.environments[0].unique_name')
echo "ENVIRONMENT_NAME=${ENVIRONMENT_NAME}"

ENVIRONMENT_DOMAIN_NAME=$(curl "https://serverless.twilio.com/v1/Services/${SERVICE_SID}/Environments" --silent --user ${AUTHENTICATION} \
  | jq --raw-output '.environments[0].domain_name')
echo "ENVIRONMENT_DOMAIN_NAME=${ENVIRONMENT_DOMAIN_NAME}"

# ---------- retrieve flow sid
FLOW_FRIENDLY_NAME=${APPLICATION_NAME}
FLOW_SID=$(curl "https://studio.twilio.com/v2/Flows" --silent --user ${AUTHENTICATION} \
  | jq --raw-output '.flows[] | select(.friendly_name | contains("'${FLOW_FRIENDLY_NAME}'")) | .sid')
if [[ -z ${FLOW_SID} ]]; then
  echo "unable to find flow.friendly_name=${FLOW_FRIENDLY_NAME} in your flows! exiting ..."
  exit 1
fi
echo "FLOW_SID=${FLOW_SID}"

# ---------- fetch flow definition json
echo "fetching flow definition for flow.friendly_name=${FLOW_FRIENDLY_NAME} ..."
curl "https://studio.twilio.com/v2/Flows/${FLOW_SID}" --silent --user ${AUTHENTICATION} \
		 | jq .definition > flow-definition.json

NGROK_URL=$(cat flow-definition.json \
    | jq --raw-output '.states[] | select(.name | contains("set_global_variables")) | .properties.variables[] | select(.key | contains("IE_ENDPOINT")) | .value')
NGROK_URL=${NGROK_URL//\//\\/}

echo ". replace ${CUSTOMER_NAME} -> YOUR_HEALTH_SYSTEM_NAME"
echo ". replace ${NGROK_URL} -> YOUR_EHR_ENDPOINT_URL"
echo ". replace ${SERVICE_SID} -> YOUR_SERVICE_SID"
echo ". replace ${ENVIRONMENT_SID} -> YOUR_ENVIRONMENT_SID"
echo ". replace ${ENVIRONMENT_DOMAIN_NAME} -> YOUR_ENVIRONMENT_DOMAIN_NAME"
cat flow-definition.json \
  | sed "s/${CUSTOMER_NAME}/YOUR_HEALTH_SYSTEM_NAME/g" \
  | sed "s/${NGROK_URL}/YOUR_EHR_ENDPOINT_URL/g" \
  | sed "s/${SERVICE_SID}/YOUR_SERVICE_SID/g" \
	| sed "s/${ENVIRONMENT_SID}/YOUR_ENVIRONMENT_SID/g" \
	| sed "s/${ENVIRONMENT_DOMAIN_NAME}/YOUR_ENVIRONMENT_DOMAIN_NAME/g" \
	> flow-0.json

declare -a FUNCTION_SID_ARRAY
FUNCTION_SID_ARRAY=($(curl "https://serverless.twilio.com/v1/Services/${SERVICE_SID}/Functions" --silent --user ${AUTHENTICATION} \
  | jq --raw-output '.functions[] | .sid'))
echo "found ${#FUNCTION_SID_ARRAY[@]} functions"

i=0
for fsid in "${FUNCTION_SID_ARRAY[@]}"
do
  j=$((i+1))
  fname=$(curl "https://serverless.twilio.com/v1/Services/${SERVICE_SID}/Functions/${fsid}" --silent --user ${AUTHENTICATION} \
    | jq --raw-output .friendly_name)
  fname=${fname:1}
  if [[ ${fname} == *"deployment"* ]]; then
    continue;
  fi
  echo "replace ${fsid} -> YOUR_FUNCTION_SID[${fname}]"
  cat flow-${i}.json | sed "s/${fsid}/YOUR_FUNCTION_SID\[${fname}\]/g" > flow-${j}.json
  i=$((i+1))
done

mv flow-${j}.json studio-flow-template.private.json

rm flow-*.json

echo
echo "packaged 'studio-flow-template.private.json' for flow.friendly_name=${FLOW_FRIENDLY_NAME}"
echo
