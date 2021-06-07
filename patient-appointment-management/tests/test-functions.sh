#!/bin/bash

echo 'This test script requires that project be running via "twilio serverless:start --env=.env.local"'
while true; do
    read -p "Do you wish to continue?" yn
    case $yn in
        [Yy]* ) break;;
        [Nn]* ) exit 0;;
        * ) echo "Please answer yes or no.";;
    esac
done

[ -z "${ACCOUNT_SID}" ]         && echo "ACCOUNT_SID not set!" && exit 1
[ -z "${AUTH_TOKEN}" ]          && echo "AUTH_TOKEN not set!" && exit 1

APPLICATION_NAME="patient-appointment-management"
AUTHENTICATION="${ACCOUNT_SID}:${AUTH_TOKEN}"

TWILIO_FLOW_SID=$(curl "https://studio.twilio.com/v2/Flows" --silent --user ${AUTHENTICATION} \
  | jq --raw-output '.flows[] | select(.friendly_name | contains("'${APPLICATION_NAME}'")) | .sid')
echo "TWILIO_FLOW_SID=${TWILIO_FLOW_SID}"


function test_function {

FUNCTION_NAME=$1
EVENT_TYPE=$2
STATUS=$3
DISPOSITION=$4
APPOINTMENT_ID=$(date +%s)

echo -n "function: ${FUNCTION_NAME} ... "

# Twilio function receives json as below
APPOINTMENT="appointment={
event_type=${EVENT_TYPE},
event_datetime_utc=2021-05-04T19:41:19Z,
patient_id=1000,
patient_first_name=Jane,
patient_last_name=Doe,
patient_phone=12223334444,
provider_id=afauci,
provider_first_name=Anthony,
provider_last_name=Fauci,
provider_callback_phone=8001112222,
appointment_location=OwlHealthClinic,
appointment_id=${APPOINTMENT_ID},
appointment_timezone=-0700,
appointment_date=2021-05-05,
appointment_datetime=2021-05-05T12:00:00.000Z,
appointment_month=May,
appointment_day_of_week=Wednesday,
appointment_time_of_day=12:00PM
}"

# strip all white spaces
APPOINTMENT=$(echo $APPOINTMENT | sed 's/ //g')

# invoke function
response=$(curl --silent --request POST http://localhost:3000/${FUNCTION_NAME} --data ${APPOINTMENT})

# echo $response | jq .
[ $(echo $response | jq .status) != $STATUS ] || exit 1
[ $(echo $response | jq .event_type) != $EVENT_TYPE ] || exit 1
[ $(echo $response | jq .appointment_s3key) != "state/flow=${TWILIO_FLOW_SID}/disposition=${DISPOSITION}/appointment2000-patient1000.json" ] || exit 1

echo "passed"
echo ". status =" $(echo $response | jq .event_type)
echo ". s3key =" $(echo $response | jq .appointment_s3key)
}



test_function 'save-booked'      'BOOKED'      'saved' 'QUEUED'
test_function 'save-cancel'      'CANCEL'      'saved' 'QUEUED'
test_function 'save-canceled'    'CANCELED'    'saved' 'QUEUED'
test_function 'save-confirm'     'CONFIRM'     'saved' 'QUEUED'
test_function 'save-confirmed'   'CONFIRMED'   'saved' 'QUEUED'
test_function 'save-modified'    'MODIFIED'    'saved' 'QUEUED'
test_function 'save-rescheduled' 'RESCHEDULED' 'saved' 'QUEUED'
test_function 'save-remind'      'REMIND'      'saved' 'REMINDED-1'
test_function 'save-remind'      'REMIND'      'saved' 'REMINDED-2'
test_function 'save-remind'      'REMIND'      'max-reminders-reached' null


exit 0

