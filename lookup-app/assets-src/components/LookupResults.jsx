import React from 'react';

function LookupResults({ results, error, loading }) {

    if (error) {
        return (
            <div className="lookupResults">
              <span className="error">{error}</span>
            </div>
      );

    } else if (loading) {
        return <div className="lookupResults">Looking up...</div>;

    } else if (!results) {
        // this is when the page is first loaded and the user hasn't tried
        // to do a lookup yet. Show nothing.
        return null;

    } else {
        return (
            <div className="lookupResults">
                <div className="lookupResultText">
                    {JSON.stringify(results, null, 2)}
                </div>
            </div>
        );
    }
}


export {LookupResults}