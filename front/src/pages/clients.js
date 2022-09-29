import React, { Fragment, useState } from 'react'
import { GetClient } from './settings'
import { useLocation } from 'react-router-dom';

var [currentClient, oldURL, url, titleClient] = '';
var clients;
//var lostClients, urlList, allColleagues, upcoming, upcoming_raw, navigation, invoices, colleagues;

export default function ClientsPage (props){
    //invoices = props['values'][1];
    //colleagues = props['values'][0]; 
    clients = props['values'][2];
    //navigation = props['values'][3];
    //lostClients = props['values'][4];
    //urlList = props['values'][5];
    //allColleagues = props['values'][6];
    //upcoming = props['values'][7];
    //upcoming_raw = props['values'][8];

    //React router
    let location = useLocation();
    url = location['pathname'].split('/').filter(function(entry) { return entry.trim() !== ''; });
    currentClient = url[1];
    //Update/re-render function
    const [update, done] = useState(false)
    const updateProcess = () => done(update => !update)

    if(oldURL !== location.pathname){
        //Actions
        currentClient = GetClient(currentClient, clients);
        titleClient = currentClient;
        oldURL = location.pathname;
        updateProcess();
    }
    
    return (
        <>
          <div className="flex place-content-center md:place-content-start">
            <h1 className="mt-2 text-xl font-semibold text-gray-900">{titleClient}</h1>
          </div>
          <div>
            <h2 className="mt-4 text-xl font-semibold text-gray-900">Work in progress...</h2>
          </div>
          
        </>
    )
}