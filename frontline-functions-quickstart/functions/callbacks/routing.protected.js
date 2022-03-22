const assets = Runtime.getAssets();
const { findWorkerForCustomer, findRandomWorker } = require(assets[
  '/providers/customers.js'
]);

const routeConversation = async (context, conversationSid, customerNumber) => {
  let workerIdentity = await findWorkerForCustomer(context, customerNumber);

  if (!workerIdentity) {
    // Customer doesn't have a worker

    // Select a random worker
    console.log('no worker identity...');
    workerIdentity = await findRandomWorker();

    /**
     * Or you can define default worker for unknown customers.
     * workerIdentity = 'example_agent@example.com'
     */
    if (!workerIdentity) {
      throw new Error(
        `Routing failed, please add workers to customersToWorkersMap or define a default worker. Conversation SID: ${conversationSid}`
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
  await client.conversations
    .conversations(conversationSid)
    .participants.create({ identity: workerIdentity })
    .then((participant) =>
      console.log('Create agent participant: ', participant.sid)
    )
    .catch((e) => console.log('Create agent participant: ', e));
};

exports.handler = async function (context, event, callback) {
  const twilioClient = context.getTwilioClient();

  console.log('Frontline Routing Callback');
  console.log(JSON.stringify(event));

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
