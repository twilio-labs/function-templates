const routeConversation = async (context, conversationSid, customerNumber) => {
  const assets = Runtime.getAssets();
  const { findWorkerForCustomer, findRandomWorker } = require(
    assets['/providers/customers.js'].path
  );
  let workerIdentity = await findWorkerForCustomer(context, customerNumber);
  if (!workerIdentity) {
    // Customer doesn't have a worker

    // Select a random worker
    console.log('no worker identity... assigning random worker');
    workerIdentity = await findRandomWorker(context);

    /**
     * Or you can define default worker for unknown customers.
     * workerIdentity = 'example_agent@example.com'
     */
    if (!workerIdentity) {
      throw new Error(
        `Routing failed, please make sure that all customers have a "worker" property assigned. Conversation SID: ${conversationSid}`
      );
    }
  }

  return workerIdentity;
};

const routeConversationToWorker = async (
  client,
  conversationSid,
  workerIdentity
) => {
  // Add worker to the conversation along with the customer
  try {
    return await client.conversations
      .conversations(conversationSid)
      .participants.create({ identity: workerIdentity })
      .then((participant) => {
        const message = `Created agent participant: ${participant.sid}`;
        console.log(message);
        return message;
      })
      .catch((err) => {
        const message = `Error creating participant ${err}`;
        console.log(message);
        throw Error(message);
      });
  } catch (err) {
    throw Error(err);
  }
};

/**
 * Inbound messages handler
 * Read more: https://www.twilio.com/docs/frontline/handle-incoming-conversations
 */
exports.handler = async function (context, event, callback) {
  console.log('[ Inbound Routing Callback ]');

  const twilioClient = context.getTwilioClient();

  try {
    const conversationSid = event.ConversationSid;
    const customerNumber = event['MessagingBinding.Address'];

    const workerIdentity = await routeConversation(
      context,
      conversationSid,
      customerNumber
    );
    const resp = await routeConversationToWorker(
      twilioClient,
      conversationSid,
      workerIdentity
    );

    return callback(null, resp);
  } catch (err) {
    console.log(`Routing failed: ${err}`);
    return callback(err);
  }
};

exports.routeConversationToWorker = routeConversationToWorker;
exports.routeConversation = routeConversation;
