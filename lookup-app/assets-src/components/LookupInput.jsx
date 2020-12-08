import React from 'react';

function LookupInput({
    handleSubmit,
    phoneNumber,
    setPhoneNumber,
    pageToken,
    setPageToken,
  }) {

    const handlePhoneNumberChange = (event) => {
      setPhoneNumber(event.target.value);
    };

    const handlePageTokenChange = (event) => {
      setPageToken(event.target.value);
    };

    return (
      <form onSubmit={handleSubmit}>

        <label for="lookup-phonenumber">
            Phone number to look up, in <a href="https://www.twilio.com/docs/glossary/what-e164">
              E.164 format
            </a>:
        </label>
        <input
          id="lookup-phonenumber"
          value={phoneNumber}
          onChange={handlePhoneNumberChange}
        ></input>

        <label for="lookup-token">Your page token:</label>
        <input
          id="lookup-token"
          value={pageToken}
          onChange={handlePageTokenChange}
          autoComplete="off"
        ></input>

        <button type="submit">Lookup</button>

      </form>
    );
  }

export {LookupInput}