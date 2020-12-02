import React, {useState, useEffect} from 'react';

function LookupResults({lookupData}) {

    const [error, setError] = useState();
    const [loading, setLoading] = useState();
    const [results, setResults] = useState();

    useEffect(()=>{
        const {pn, pageToken} = lookupData;

        if (pn && pageToken){
            setLoading(true);

            fetch('/lookup', {
                method: 'POST',
                headers: {'content-type': 'application/json'},
                body: JSON.stringify(lookupData)

            }).then( res => {
                
                if (res.ok){
                    res.json().then( lookupResults => {
                        setLoading(false);
                        setError(null); 
                        setResults(lookupResults);    
                    });

                } else {
                    res.text().then( errorText => {
                        setLoading(false);
                        setError(errorText);
                        setResults(null);
                    });
                }
            });
        }

    }, [lookupData]);

    if (error){
        return <div className="lookupResults">
                    <span className="error">{error}</span>
               </div>

    } else if (loading){
        return <div className="lookupResults">
                    Looking up...
               </div>

    } else if (!results){
        return null;

    } else {
        return <div className="lookupResults">
                    <div className="lookupResultText">
                        {JSON.stringify(results, null, 2)}
                    </div>
               </div>
        
    }
}

export {LookupResults}