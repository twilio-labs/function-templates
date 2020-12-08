import React, {useState} from 'react';
import ReactDOM from 'react-dom';
import {LookupInput} from './components/LookupInput';
import {LookupResults} from './components/LookupResults';

const LookupSpa = () => {
    const [phoneNumber, setPhoneNumber] = useState("");
    const [pageToken, setPageToken] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [results, setResults] = useState(null);

    const handleSubmit = (event) => {
        event.preventDefault();
        setLoading(true);

        fetch("/lookup", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({phoneNumber, pageToken}),

        }).then((res) => {
            setLoading(false);

            if (res.ok) {
                res.json().then((lookupResults) => {
                    setError(null);
                    setResults(lookupResults);
                });
            } else {
                res.text().then((errorText) => {
                    setError(errorText);
                    setResults(null);
                });
            }
        });
    }

    return <div>
        <LookupInput
            handleSubmit={handleSubmit}
            setPhoneNumber={setPhoneNumber}
            phoneNumber={phoneNumber}
            setPageToken={setPageToken}
            pageToken={pageToken}
        />
        <LookupResults
            results={results}
            error={error}
            loading={loading}
        />
    </div>
}


ReactDOM.render(<LookupSpa />, document.getElementById('lookup-app'));