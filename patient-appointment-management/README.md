# Patient Appointment Management Technical Guide

This document is provided as a technical guide customer's technical personnel
for understanding the application architecture and technical guide for customizations.

## Application Overview

Patient Appointment Management (PAM) application
integrates with your EHR
to enable 2-way SMS communication with your patients
for appointments such as notifications and reminders.

Specifically, PAM implements these following capabilitie:

- 1-way (outbound SMS to patients) notification of
  appointment event occurring in your EHR:
  - appointment booking/scheduling
  - appointment rescheduling of date/time changes
  - appointment modification of location and/or provider
  - appointment confirmation
  - appointment cancellation
  - appointment noshows

- 2-way (inbound SMS response from patient) sent to your EHR
  - request appointment confirmation
  - request appointment cancellation

- scheduled appointment reminders up to 2 reminders

Please reference [Customer Implementation Guide](http://www.google.com)
for more details on appointment events managed by this application.

# Implementation Guide

This section covers the technical aspects of implementing this application.

## Pre-requisites

The following pre-requisites must be satisfied prior to installing this application.

### Provisioned Before Deploying

- Twilio account. You can sign up [here](https://www.twilio.com/try-twilio)
- Twilio phone number for send SMS from.
  Once Twilio account is provisioned you can purchase a phone number
  to used in the application from [here](https://www.twilio.com/console/phone-numbers/incoming).
  Make sure the phone number is SMS enabled.
- AWS account dedicated for this application deployment.
  As admin-level privilege will be required to create various
  AWS resources including IAM role/user/policy,
  we **strongly** recommend that you create a dedicated AWS account
  separate from other AWS accounts that your organization owns.
  You may place the new AWS account within your [AWS Organizations](https://docs.aws.amazon.com/organizations/latest/userguide/orgs_introduction.html)
  for consolidated billing.
- IAM user (aka "deployer") AWS credentials (i.e., `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESSS_KEY`)
  of an IAM user with AWS `AdministratorAccess` policy assigned.
  This IAM user will be used to create the `CloudFormation` stacks of this application.
  Note that once the application is fully deployed and working,
  you can remove the credentials for further secure you application and data.

### Environment Variables Specified During Deployment

This application requires the environment variable below to be set
for proper deployment.

You will input all environment variable in the initial CodeExchange deployment screen.
After the application is deployed, you can find the environment variables in your `.env` file.:

| Variable | Description | Required |
| :------- | :---------- | :------- |
|`CUSTOMER_NAME`                 |Your organization name to apper in SMS message text|Yes|
|`CUSTOMER_CODE`                 |Your organization short name suffixed to AWS resources|Yes|
|`CUSTOMER_EHR_ENDPOINT_URL`     |Your organization's inbound EHR endpoint for communication from Twilio via HTTP POST. Please refer to [Integrator Implementation Guide]() for more technical details.|Yes|
|`REMINDER_OUTREACH_START`       |Appointment reminder outreach window start time (HHMM) in local timezone, inclusive. default 0000 (i.e., midnight)|Yes|
|`REMINDER_OUTREACH_FINISH`      |Appointment reminder outreach window end   time (HHMM) in local timezone, exclusive. default 2400 (i.e., midnight)|Yes|
|`REMINDER_FIRST_OFFSET`         |Offset (HHMM) when the 1st appointment reminder is to be sent. default 4800|Yes|
|`REMINDER_SECOND_OFFSET`        |Offset (HHMM) when the 2nd appointment reminder is to be sent. default 2400|Yes|
|`TWILIO_PHONE_NUMBER`           |Your Twilio phone number for sending and receiving SMS|Yes|
|`ADMIN_PASSWORD`                |Password to restrict access to sensitive data|Yes|
|`SALT`                          |Change this to invalidate existing auth tokens|No|
|`DEPLOYER_AWS_ACCESS_KEY_ID`    |`AWS_ACCESS_KEY_ID` of the IAM user you provisioned for deploying this application|Yes|
|`DEPLOYER_AWS_SECRET_ACCESS_KEY`|`AWS_ACCESS_KEY_ID` of the IAM user you provisioned for deploying this application|Yes|
|`AWS_REGION`                    |`AWS_REGION` where your AWS resources will be deployed. We **strongly** recommend not changing this due to slightly differences between AWS regions.|Yes|

To keep your tokens and secrets secure, make sure to not commit the `.env` file in git. When setting up the project with `twilio serverless:init ...` the Twilio CLI will create a `.gitignore` file that excludes `.env` from the version history.

# Application Architecture

Architecture consists of 3 main components that interact closely together:

- Studio Flow that implements the SMS interaction with the patient
- Functions that store appointment events to AWS S3
- AWS resources including an S3 bucket for storing up-to-date appointment
  information as well as scheduling appointment reminders

![Technical Architecture](assets/architecture.png)

## Application Components

### Studio Flow

Studio Flow implements:

- SMS interaction (outbound & inbound) with the patient per appointment event occurrence
- Saving appointment event information to AWS S3 bucket via calling Twilio functions
- Communicating to your EHR endpoint for 2-way (inbound to EHR) appointment requests
  such as 'appointment cancel request' & 'appointment confirm request'

### Service (Assets/Functions)

#### Assets

Static assets (files) of the application:

| Asset | Description |
| :---- | :---------- |
|`assets/architecture.png`                                |Technical architecture diagram|
|`assets/controller.js`                                   |Javascript functions that control application behavior from `index.html`|
|`assets/index.html`                                      |Main application page for application user|
|`assets/state-transition.png`                            |Disposition/state transition diagram|
|`assets/studio-flow-template.private.json`               |Deployable Studio Flow template|
|`assets/style.css`                                       |Stylesheet used in `index.html`|
|`assets/aws/cloudformation-stack-application.private.yml`|AWS CloudFormation template for applications resources|
|`assets/aws/cloudformation-stack-bucket.private.yml`     |AWS CloudFormation template for S3 bucket|
|`assets/aws/query_appointment_history.private.js`        |Lambda function code for querying appointment event history stored in S3|
|`assets/aws/query_appointment_state.private.js`          |Lambda function code for querying appointment event state (snapshot) stored in S3|
|`assets/aws/send_appointment_reminders.private.js`       |Lambda function code for sending appointment reminders per 4 reminder configuration parameters|

#### Functions

| Functions | Description |
| :-------- | :---------- |
|`deployment/auth.private.js`          |Checks authorization|
|`deployment/helpers.private.js`       |Shared functions used by other functions|
|`deployment/login.js`                 |Handles login from `index.html` page|
|`deployment/save-booked.js`           |Saved booked appointment notification event to S3 bucket|
|`deployment/save-cancel.js`           |Saves cancel appointment request event to S3 bucket|
|`deployment/save-canceled.js`         |Saves canceld appointment notification event to S3 bucket|
|`deployment/save-confirm.js`          |Saves confirm appointment request event to S3 bucket|
|`deployment/save-confirmed.js`        |Saves confirmed appointment notification event to S3 bucket|
|`deployment/save-modified.js`         |Saves modified appointment notification event to S3 bucket|
|`deployment/save-noshowed.js`         |Saves noshowed appointment notification event to S3 bucket|
|`deployment/save-opted-out.js`        |Saves opted-out appointment notification event to S3 bucket|
|`deployment/save-remind.js`           |Saves appointment reminder event to S3 bucket|
|`deployment/save-rescheduled.js`      |Saves rescheduled appointment notification event to S3 bucket|
|`deployment/check.js`                 |Returns all application parameters|
|`deployment/check-aws-application.js` |Checks deployment state of aws application|
|`deployment/check-aws-bucket.js`      |Checks deployment state of aws bucket|
|`deployment/check-query.js`           |Checks execute state of appointment data query|
|`deployment/check-studio-flow.js`     |Checks deployment state of studio flow|
|`deployment/deploy-aws-application.js`|Deploys aws application|
|`deployment/deploy-aws-bucket.js`     |Deploys aws bucket|
|`deployment/deploy-aws-code.js`       |Deploys aws lambda code|
|`deployment/deploy-studio-flow.js`    |Deploys studio flow|
|`deployment/execute-query.js`         |Executes appointment data query|

### AWS Resources

| Resource Type | Resource Name | Description |
| :------------ | :------------ | :---------- |
|`AWS::S3::Bucket`        |twilio-patient-appointment-management-owlhealth|Stores appointment data and lambda function code|
|`AWS::Athena::WorkGroup` |twilio-patient-appointment-management-owlhealth|Predefined Athena Workgroup|
|`AWS::Events::Rule`      |twilio-trigger-send-appointment-reminders-owlhealth|Hourly scheduler for appointment reminder|
|`AWS::Lambda::Function`  |twilio-send-appointment-reminders-owlhealth|Iterates through appointments to send scheduled reminders|
|`AWS::Glue::Crawler`     |twilio-patient-appointment-management-owlhealth|Crawls appointment `state` and `history` files on S3|
|`AWS::Lambda::Function`  |twilio-query-appointment-state-owlhealth|Queries appointment `state` data using Athena and returns a signedURL for downloadable results|
|`AWS::StepFunctions::StateMachine`|twilio-query-appointment-state-owlhealth|Synchronously executes lambda function for `state`|
|`AWS::Lambda::Function`  |twilio-query-appointment-history-owlhealth|Queries appointment `history` data using Athena and returns a signedURL for downloadable results|
|`AWS::StepFunctions::StateMachine`|twilio-query-appointment-history-owlhealth|Synchronously executes lambda function for `history`|
|`AWS::IAM::ManagedPolicy`|twilio-patient-appointment-management-policy-owlhealth|Shared AWS permissions for application|
|`AWS::IAM::Role`         |twilio-patient-appointment-management-role-owlhealth|Role used by all AWS resources of this application|
|`AWS::IAM::User`         |twilio-patient-appointment-management-user-owlhealth|User used by Twilio to authenticate to AWS resources of this application|

## Appointment States (Events & Dispositions)

Appointment state is represented through transition of dispositions based on events.
Blue box represents `disposition` that appointments transition through based on events.
EHR initiated events are highlighted in <span style="color:#0d7aff">blue</span>
, while Twilio (or the patient response to SMS) initiated events are highlighted in <span style="color:#c92d39">red</span>.

![State Transition](assets/state-transition.png)

Ideally, initial appointment event should be `booked`.
However, appointment events integrated from EHR will include appointment already booked in the EHR system.
Therefore, the application can accept any appointment event as the initial event and correctly transition the disposition state.

# Technical Guide

This section is intended for technical developers
who wish to customize this blue print application to meet your organization's specific requirements.

## Setup Development Environment

In order to create a separate instance of the application for development purposes,
you will need to provision a separate (1) Twilio account; (2) AWS account; and (3) EHR endpoint
to avoid resource name clashes.

1. Install the [Twilio CLI](https://www.twilio.com/docs/twilio-cli/quickstart#install-twilio-cli)
2. Install the [serverless toolkit](https://www.twilio.com/docs/labs/serverless-toolkit/getting-started)

```shell
twilio plugins:install @twilio-labs/plugin-serverless
```

3. Initiate a new project copy that will create a directory `patient-appointment-management`

```
twilio serverless:init patient-appointment-management --template=patient-appointment-management
```

3. Copy `.env` file to `.env.localhost` and supply the appropriate values for the environment variables

4. Start the server locally using `.env.localhost` with the [Twilio CLI](https://www.twilio.com/docs/twilio-cli/quickstart):

```
twilio serverless:start --env=.env.localhost
```

5. Open the web page at https://localhost:3000/index.html

6. Deploy the following

- Studio Flow
- AWS Bucket
- AWS Application

## Customizing Studio Flow

You can customize the studio flow to meet your needs.
Please reference [Twilio Studio Documentation](https://www.twilio.com/docs/studio).

Make sure to 'Publish' your flow after make changes.

## Customizing Service

You can customize the service assets & functions to meet your needs.
Please reference [Twilio Runtime](https://www.twilio.com/docs/runtime).

You can test your service locally against deployed Studio Flow and AWS resources.

When you are satified with your changes, deploy your functions and assets with either of the following commands.
Note: you must run these commands from inside your project folder. [More details in the docs.](https://www.twilio.com/docs/labs/serverless-toolkit)

With the [Twilio CLI](https://www.twilio.com/docs/twilio-cli/quickstart):

```
twilio serverless:deploy
```

## Customizing AWS Resources

All AWS resources are deployed through `CloudFormation` template.
Therefore, while any resource change made through AWS Web console is possible,
the changes will not be permanent. You will have to update the `CloudFormation` template file.
To deploy the updated template file, with the project running locally, run the following:

- if bucket template was changed,

```
curl --silent "http://localhost:3000/deployment/deploy-aws-bucket"
```

- If lambda code was changed,

```
curl --silent "http://localhost:3000/deployment/deploy-aws-code"
```

- If aws application template was changed,

```
curl --silent "http://localhost:3000/deployment/deploy-aws-code"
```

