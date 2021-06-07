THIS = 'send-outreach-pcp:'

import os
import csv
import json
import logging
import boto3
from twilio.rest import Client


def lambda_handler(event, context):

    logger = logging.getLogger()
    logger.setLevel(logging.INFO)

    assert 'AWS_REGION'                in os.environ, 'missing os.environ[AWS_REGION]'
    assert 'OUTREACH_S3_BUCKET'        in os.environ, 'missing os.environ[OUTREACH_S3_BUCKET]'
    assert 'PATIENT_FILENAME_PATTERN'  in os.environ, 'missing os.environ[PATIENT_FILENAME_PATTERN]'
    assert 'TWILIO_ACCOUNT_SID'        in os.environ, 'missing on.environ[TWILIO_ACCOUNT_SID]'
    assert 'TWILIO_AUTH_TOKEN'         in os.environ, 'missing on.environ[TWILIO_AUTH_TOKEN]'
    assert 'TWILIO_FLOW_SID'           in os.environ, 'missing on.environ[TWILIO_FLOW_SID]'
    assert 'TWILIO_PHONE_NUMBER'       in os.environ, 'missing on.environ[TWILIO_PHONE_NUMBER]'

    AWS_REGION                = os.environ['AWS_REGION']
    OUTREACH_S3_BUCKET        = os.environ['OUTREACH_S3_BUCKET']
    PATIENT_FILENAME_PATTERN  = os.environ['PATIENT_FILENAME_PATTERN']
    TWILIO_ACCOUNT_SID        = os.environ['TWILIO_ACCOUNT_SID']
    TWILIO_AUTH_TOKEN         = os.environ['TWILIO_AUTH_TOKEN']
    TWILIO_FLOW_SID           = os.environ['TWILIO_FLOW_SID']
    TWILIO_FROM_NUMBER        = os.environ['TWILIO_FROM_NUMBER']

    session = boto3.session.Session(region_name=AWS_REGION)
    s3c     = boto3.client('s3', region_name=session.region_name)

    # ---------- load patient list
    outreach_s3key = None
    outreach_id    = None

    # outreach filename pattern: outreach-{outreach_id}.csv
    response = s3c.list_objects_v2(Bucket=BROADCASTS_S3BUCKET, Prefix='to-outreach/')
    for content in response['Contents']:
        s3key = content['Key']
        logger.info(f'found {s3key}')
        if s3key.find('/outreach-') != -1 and s3key.endswith('.csv'):
            outreach_s3key = s3key
            outreach_id = s3key.split('/')[-1].replace('outreach-', '').replace('.csv', '')
            logger.info(f'loading {s3key}')
            logger.info(f'outreach_id={outreach_id}')
            break

    if outreach_s3key == None:
        return {
            'statusCode': 201,
            'response': 'no outreach csv file found. exiting ...',
        }
    logger.info (f'loading outreach file: s3://{BROADCASTS_S3BUCKET}/{outreach_s3key}')

    patients = []
    response = s3c.get_object(Bucket=BROADCASTS_S3BUCKET, Key=outreach_s3key)
    lines = response['Body'].read().decode('utf-8').splitlines()
    for row in csv.DictReader(lines):
        patients.append(row)
    logger.info (f'loaded {len(patients)} patients:')

    client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
    n_success = 0
    n_error   = 0
    for patient in patients:
        patient['outreach_id'] = outreach_id
        logger.info(f'patient={patient}')

        if 'patient_id' not in patient:
            n_error += 1
            patient['disposition'] = 'error-missing:patient_id'
        elif 'patient_first_name' not in patient:
            n_error += 1
            patient['disposition'] = 'error-missing:patient_first_name'
        else:
            try:
                execution = client.studio \
                    .flows(TWILIO_FLOW_SID) \
                    .executions \
                    .create(
                        parameters=patient,
                        to=patient['patient_phone'],
                        from_=TWILIO_FROM_NUMBER,
                    )
                logger.info(f'execution.sid={execution.sid}')
                patient['disposition'] = 'success-executing-flow'
                n_success += 1
            except Exception as e:
                n_error += 1
                patient['disposition'] = 'error-executing-flow'
                logger.info(f'unable to execute studio flow {TWILIO_FLOW_SID}')
                logger.info(e)

        # put patient file
        patient_s3key = os.path.join(
            'outreaches',
            'outreach=' + outreach_id,
            PATIENT_FILENAME_PATTERN.format(patient_id=patient['patient_id'])
        )
        response = s3c.put_object(
            Body=json.dumps(patient),
            Bucket=BROADCASTS_S3BUCKET,
            Key=patient_s3key
        )
        logger.info(f'PUT {patient_s3key}')

    assert len(patients) == n_success + n_error, f'ERROR: checksum error total:{len(patients)} != n_success:{n_success} + n_error:{n_error}'

    # remove processed patient list file
    response = s3c.delete_object(Bucket=BROADCASTS_S3BUCKET, Key=outreach_s3key)

    result = {
        'statusCode': 200,
        'response': {
            'loaded': len(patients),
            'outreach-success': n_success,
            'outreach-failure': n_error,
        }
    }

    return result


# for running locally
if __name__ == '__main__':
    os.environ['AWS_REGION'] = 'us-east-1'
    os.environ['BROADCASTS_S3BUCKET'] = 'twlo-broadcasts-bochoi'
    os.environ['PATIENT_FILENAME_PATTERN'] = 'patient-{patient_id}.json'
    os.environ['TWILIO_ACCOUNT_SID'] = 'AC11724f20ee05d7c93f7225785fdac13d'
    os.environ['TWILIO_AUTH_TOKEN'] = '93cd5233ec03c50fb2952ae24feb8e59'
    os.environ['TWILIO_FLOW_SID'] = 'FWe92260e8f7efa6f0dff3c0abe7dacf5c'
    os.environ['TWILIO_FROM_NUMBER'] = '+18312925821'

    event = {}
    result = lambda_handler(event, None)
    print(f'result={result}')
