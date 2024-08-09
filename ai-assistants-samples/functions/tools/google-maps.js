/* eslint-disable camelcase */

/**
 * @param {import('@twilio-labs/serverless-runtime-types/types').Context} context
 * @param {{}} event
 * @param {import('@twilio-labs/serverless-runtime-types/types').ServerlessCallback} callback
 */
exports.handler = async function (context, event, callback) {
  if (!context.GOOGLE_MAPS_API_KEY) {
    return callback(new Error('Missing API Key'));
  }

  const { location, name } = event;

  if (!location || !name) {
    return callback(new Error('Invalid request. Missing location or name'));
  }

  const searchResponse = await fetch(
    `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?fields=place_id&input=${location} ${name}&inputtype=textquery&key=${context.GOOGLE_MAPS_API_KEY}`
  );

  if (!searchResponse.ok) {
    console.error(await searchResponse.text());
    return callback(new Error('Failed to get response from Google Maps'));
  }

  const searchData = await searchResponse.json();

  if (searchData.candidates.length === 0) {
    return callback(null, 'No Results Found');
  }

  const placeId = searchData.candidates[0].place_id;

  const detailsResponse = await fetch(
    `https://maps.googleapis.com/maps/api/place/details/json?fields=name%2Ccurrent_opening_hours%2Cformatted_address%2Cformatted_phone_number&place_id=${placeId}&key=${context.GOOGLE_MAPS_API_KEY}`
  );

  if (!detailsResponse.ok) {
    console.error(await detailsResponse.text());
    return callback(new Error('Failed to get details from Google Maps'));
  }

  const detailsData = await detailsResponse.json();

  return callback(null, {
    name: detailsData.result?.name,
    address: detailsData.result?.formatted_address,
    phone_number: detailsData.result?.formatted_phone_number,
    opening_hours: detailsData.result?.current_opening_hours?.weekday_text,
  });
};
