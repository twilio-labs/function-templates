# International Telephone Input - Agent Guidelines

This document provides AI assistants with essential information for working with the International Telephone Input project.

## Project Overview

This template implements an international phone number input form with validation using:
- intl-tel-input library (v23.1.0) for international phone number formatting and country selection
- Twilio Lookup API v2 for server-side phone number validation
- Twilio Paste theme CSS (ce-paste-theme.css) for consistent styling

The application allows users to enter phone numbers with automatic country detection, real-time format validation, and server-side verification through the Twilio Lookup API. The form automatically detects the user's country based on their IP address and formats phone numbers according to that country's standards.

## Documentation Links

All Twilio documentation URLs in this guide can be accessed in markdown format by adding `.md` to the end of the URL.

## Do-Not-Touch Areas

### 1. Lookup API Endpoint

The `/lookup` function endpoint (`functions/lookup.js`) must remain unchanged. The frontend depends on this exact path and response format:

```json
{
  "success": boolean,
  "error": string  // only present when success is false
}
```

Never change the endpoint path or response structure without updating the frontend accordingly.

### 2. Lookup API Parameters

Never modify the required parameter structure:
- `phone` parameter must be in E.164 format (e.g., +14155552671)
- The function expects this via POST request with URL-encoded body
- Missing or empty phone parameter will return an error

### 3. intl-tel-input Integration

The library is loaded from CDN (v23.1.0). Key configurations that should not be modified without careful consideration:

- `utilsScript` path - Required for validation and formatting functionality
- `getNumber()` method - Returns E.164 format required by Lookup API
- `initialCountry: "auto"` - Enables automatic country detection
- `geoIpLookup` using ipapi.co - Provides geolocation for country detection

### 4. Sensitive Data

Never expose or hardcode:
- Twilio Account SID and Auth Token (always use environment variables)
- API keys or credentials
- User phone numbers in logs or error messages

## Coding Conventions

### Styling

The template uses Twilio Paste theme CSS (`ce-paste-theme.css`) for consistent styling. Key classes: `.page-top`, `.content`, `.form-field`, `.button-primary`, `.alert-info`, `.alert-error`. Keep vanilla JavaScript for simplicity.

### Phone Number Handling

Always use intl-tel-input methods to ensure proper formatting:

```javascript
// Get E.164 formatted number (required by Lookup API)
const phoneNumber = phoneInput.getNumber();

// Optional: Validate format before API call
if (phoneInput.isValidNumber()) {
  // Proceed with API call
}
```

### API Integration Pattern

The standard pattern for calling the Lookup API:

```javascript
const data = new URLSearchParams();
data.append("phone", phoneNumber);

fetch("./lookup", {
  method: "POST",
  body: data,
})
  .then((response) => response.json())
  .then((json) => {
    if (json.success) {
      // Handle success
    } else {
      // Handle error: json.error contains the error message
    }
  })
  .catch((err) => {
    // Handle network or other errors
  });
```

## Tests

Run `npm test` from the repository root. Comprehensive test coverage exists in `tests/lookup.test.js` for the backend function, covering:
- Missing phone parameter validation
- Empty phone parameter validation
- Invalid phone number handling
- Valid phone number verification
- Error response formats

## Common Tasks

### Adding Additional Lookup API Data

The Lookup API can return carrier information, caller name, and more. To add this:

1. Modify `functions/lookup.js` to fetch additional data:
```javascript
const lookup = await client.lookups.v2.phoneNumbers(event.phone).fetch({
  fields: 'caller_name,line_type_intelligence'
});

// Return additional fields in response
response.setBody({ 
  success, 
  callerName: lookup.callerName,
  lineType: lookup.lineTypeIntelligence
});
```

2. Update the frontend to display the new data:
```javascript
if (json.success) {
  info.innerHTML = `
    Phone number: <strong>${phoneNumber}</strong><br>
    Carrier: ${json.lineType?.carrier_name || 'Unknown'}
  `;
}
```

### Customizing Error Messages

Error messages come from two sources:

1. **Client-side** (intl-tel-input validation):
   - Check `phoneInput.isValidNumber()` before submitting
   - Use `phoneInput.getValidationError()` for specific error codes

2. **Server-side** (Lookup API):
   - Errors are returned in `json.error` field
   - Customize by parsing error types in the frontend

### Changing the Default Country

To change the default country when geolocation fails:

```javascript
const phoneInput = window.intlTelInput(inputField, {
  initialCountry: "us", // Change from "auto" to a specific country code
  // ... other config
});
```

### Adding UI Loading States

The template includes a loading state pattern:

```javascript
// Before API call
submitButton.disabled = true;
submitButton.textContent = "Verifying...";

// After API response (in .finally())
submitButton.disabled = false;
submitButton.textContent = "Verify";
```

Apply this pattern to any new async operations.

## Further Resources

- [Twilio Lookup API v2 Documentation](https://www.twilio.com/docs/lookup/v2-api)
- [intl-tel-input Library Documentation](https://github.com/jackocnr/intl-tel-input)
- [Phone Verification Template](https://github.com/twilio-labs/function-templates/tree/main/verify) - Recommended for production phone number collection
- [International Phone Number Input Blog Post](https://www.twilio.com/blog/international-phone-number-input-html-javascript)
- [Twilio Paste Design System](https://paste.twilio.design/)
