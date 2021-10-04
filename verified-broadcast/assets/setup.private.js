function isEnvDefined(variable) {
  if (typeof variable !== 'string') {
    return false;
  }

  const sanitizedVariable = variable.trim();
  if (sanitizedVariable === '""') {
    return false;
  }

  return sanitizedVariable.length > 0;
}

async function updateEnvironmentVariable(twilioClient, context, key, value) {
  if (
    !isEnvDefined(context.SERVICE_SID) &&
    !isEnvDefined(context.ENVIRONMENT_SID)
  ) {
    context[key] = value;
    process.env[key] = value;
    return;
  }
  if (context[key] === value) {
    // variable already exists
  } else if (context[key]) {
    const existingVariables = await twilioClient.serverless
      .services(context.SERVICE_SID)
      .environments(context.ENVIRONMENT_SID)
      .variables.list();
    const [variableToUpdate] = existingVariables.filter(
      (variable) => variable.key === key
    );
    if (variableToUpdate) {
      variableToUpdate.update({ value });
    }
    context[key] = value;
    process.env[key] = value;
  } else {
    await twilioClient.serverless
      .services(context.SERVICE_SID)
      .environments(context.ENVIRONMENT_SID)
      .variables.create({
        key,
        value,
      });
    context[key] = value;
    process.env[key] = value;
  }
}

async function getMessagingServiceFromPhoneNumber(
  twilioClient,
  targetPhoneNumber
) {
  const messagingServices = await twilioClient.messaging.services.list({
    limit: 2000,
  });

  const phoneNumberMap = new Map();
  const requests = messagingServices.map(async (service) => {
    const numbers = await twilioClient.messaging
      .services(service.sid)
      .phoneNumbers.list({ limit: 2000 });
    numbers.forEach(({ phoneNumber }) => {
      phoneNumberMap.set(phoneNumber, service.sid);
    });
    return true;
  });
  await Promise.all(requests);

  if (phoneNumberMap.has(targetPhoneNumber)) {
    return phoneNumberMap.get(targetPhoneNumber);
  }
  return null;
}

async function setupMessagingService(twilioClient, context) {
  if (!isEnvDefined(context.TWILIO_PHONE_NUMBER)) {
    throw new Error(
      'Cannot create a Messaging Service without a TWILIO_PHONE_NUMBER'
    );
  }

  const existingServiceSid = await getMessagingServiceFromPhoneNumber(
    twilioClient,
    context.TWILIO_PHONE_NUMBER
  );
  if (existingServiceSid !== null) {
    await updateEnvironmentVariable(
      twilioClient,
      context,
      'MESSAGING_SERVICE_SID',
      existingServiceSid
    );
    return context.MESSAGING_SERVICE_SID;
  }

  const { sid } = await twilioClient.messaging.services.create({
    friendlyName: 'Verified Broadcast Messaging Service',
    useInboundWebhookOnNumber: true,
  });
  const [{ sid: phoneNumberSid }] =
    await twilioClient.incomingPhoneNumbers.list({
      phoneNumber: context.TWILIO_PHONE_NUMBER,
    });
  if (!phoneNumberSid) {
    throw new Error('Failed to fetch phone number');
  }
  await twilioClient.messaging.services(sid).phoneNumbers.create({
    phoneNumberSid,
  });
  await updateEnvironmentVariable(
    twilioClient,
    context,
    'MESSAGING_SERVICE_SID',
    sid
  );
  return context.MESSAGING_SERVICE_SID;
}

async function setupNotifyService(twilioClient, context) {
  const { sid } = await twilioClient.notify.services.create({
    friendlyName: 'Verified Broadcast Notify Service',
    messagingServiceSid: context.MESSAGING_SERVICE_SID,
  });
  await updateEnvironmentVariable(
    twilioClient,
    context,
    'BROADCAST_NOTIFY_SERVICE_SID',
    sid
  );
  return context.BROADCAST_NOTIFY_SERVICE_SID;
}

async function setupVerifyService(twilioClient, context) {
  const { sid } = await twilioClient.verify.services.create({
    friendlyName: 'Verified Broadcast',
  });
  await updateEnvironmentVariable(
    twilioClient,
    context,
    'VERIFY_SERVICE_SID',
    sid
  );
  return context.VERIFY_SERVICE_SID;
}

async function setupResourcesIfRequired(context) {
  try {
    const isLocalDevelopment =
      !isEnvDefined(context.SERVICE_SID) &&
      !isEnvDefined(context.ENVIRONMENT_SID);
    const hasOneServiceUndefined =
      !isEnvDefined(context.BROADCAST_NOTIFY_SERVICE_SID) ||
      !isEnvDefined(context.VERIFY_SERVICE_SID);
    if (isLocalDevelopment && hasOneServiceUndefined) {
      console.error(
        'You are running this code outside of a deployed Twilio Functions environment. Please set VERIFY_SERVICE_SID and BROADCAST_NOTIFY_SERVICE_SID manually in your .env file.'
      );
      return false;
    }

    if (
      !isEnvDefined(context.BROADCAST_NOTIFY_SERVICE_SID) &&
      !isEnvDefined(context.MESSAGING_SERVICE_SID) &&
      !isEnvDefined(context.TWILIO_PHONE_NUMBER)
    ) {
      console.error('Missing Twilio Phone Number');
      return false;
    }

    const twilioClient = context.getTwilioClient();
    if (!isEnvDefined(context.BROADCAST_NOTIFY_SERVICE_SID)) {
      if (!isEnvDefined(context.MESSAGING_SERVICE_SID)) {
        await setupMessagingService(twilioClient, context);
      }
      await setupNotifyService(twilioClient, context);
    }
    if (!isEnvDefined(context.VERIFY_SERVICE_SID)) {
      await setupVerifyService(twilioClient, context);
    }
    return true;
  } catch (err) {
    console.error('Failed to set up services');
    console.error(err.message);
    console.error(
      'Try configuring Notify & Verify Services manually by setting VERIFY_SERVICE_SID and BROADCAST_NOTIFY_SERVICE_SID in your environment directly.'
    );
    return false;
  }
}

module.exports = { setupResourcesIfRequired };
