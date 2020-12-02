import React, {useState} from 'react';
import ReactDOM from 'react-dom';
import {LookupInput} from './components/LookupInput';
import {LookupResults} from './components/LookupResults';

const LookupSpa = () => {
    const [lookupData, setLookupData] = useState({pn:null, pageToken:null});
    
    return <div>
        <LookupInput setLookupData={setLookupData}/>
        <LookupResults lookupData={lookupData}/>
    </div>
}

ReactDOM.render(<LookupSpa />, document.getElementById('lookup-app'));