exports.handler = async function (context, event, callback) {
  const client = context.getTwilioClient();

  console.log(`Deleting ${context.SERVICE_SID}`);
  return client.serverless.v1
    .services(context.SERVICE_SID)
    .remove()
    .then((res) => {
      console.log(res);
      callback();
    })
    .catch((err) => {
      console.error(err);
      console.error(err.details);
      callback();
    });
};
