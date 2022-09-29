import React, { Fragment, useState } from 'react'
import { ArrowSmDownIcon, ArrowSmUpIcon } from '@heroicons/react/solid'
import { GetLateInvoices, GetCelebrations, GetScoreboard, GetChart  } from './overviewfunc'
import { GetZoom } from './settings'
import { useLocation } from 'react-router-dom';
import ReactEcharts from "echarts-for-react"; 

var url;
var oldURL = '';

//Changable Settings
let celebrationsListAmount = 5;
var currentZoom = 'Loading...';


//CRM Scoreboard
var crmScoreboard = [
{id:1, name:'Revenue', stat:'', change:'', changeType: '', changeShow:"true", reverse: false},
{id:2, name:'Clients', stat:'', change:'', changeType: '', changeShow:"true", reverse: false},
{id:3, name:'Colleagues', stat:'', change: '', changeType: '',changeShow:"false", reverse: false},
];
var clients, upcoming_raw;
//var urlList;

//Celebrations
var showShowMore = true;
var showCelebrations;

var colleagues = [{id:1, name:'Loading...', start_date:'loading...', team:'Loading...', birthday:'Loading...', image_url:''}]
var celebrations = [{id:1, name:'Loading...', start_date:'loading...', team:'Loading...', birthday:'Loading...', image_url:''}]

//Late Invoice
var lateInvoiceList = [];
var invoices= [];
var isInvoicesEmpty = false;

//Get Charts
var monthlyRevenueChart, lostRevenueChart;

//var navigation;

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function Overview (props){
//Passed Props
//console.log(props);
invoices = props['values'][1];
colleagues = props['values'][0]; 
clients = props['values'][2];
//navigation = props['values'][3];
//lostClients = props['values'][4];
//urlList = props['values'][5];
//allColleagues = props['values'][6];
//upcoming = props['values'][7];
upcoming_raw = props['values'][8];
//React router
let location = useLocation();
//let navigate = useNavigate();

//Handle invoice link clicks
const handleInvoiceClick = (invURL) => {
  window.open(invURL);
};

//Update/re-render function
const [update, done] = useState(false)
const updateProcess = () => done(update => !update)
const scoreCardStyle = (crmScoreboard.length === 4 ? "mb-5 grid grid-cols-1 gap-5 sm:grid-cols-2 scorecard:grid-cols-3" : "mb-5 grid grid-cols-1 gap-5 md:grid-cols-3")
								

//After Initial Render
//React.useEffect(() => {
  //console.log('locations state: ',location.state, ' & props: ', props.values);
  if(oldURL !== location.pathname){
    celebrationsListAmount = 5;
    url = location['pathname'].split('/').filter(function(entry) { return entry.trim() !== ''; });
    
    /*
    //Check Url Is Valid:
    if(location.pathname.slice(-1) === '/'){
      var cPath = location.pathname.slice(0, -1);
      if(!urlList.includes(cPath)){
        navigate('/org', {replace:true});
      }
    }
    else if(!urlList.includes(location.pathname)){
      navigate('/org', {replace:true});
    }*/

    
    
    if(url.length === 3){
      currentZoom = url[2].split('-').map(word => {
          return word.charAt(0).toUpperCase() + word.slice(1);
        }).join(' ');
      showCelebrations = false;
    }
    else if(url.length === 2){
      currentZoom = url[1].split('-').map(word => {
          return word.charAt(0).toUpperCase() + word.slice(1);
        }).join(' ');
      showCelebrations = true;
    }
    else{
      currentZoom = 'ORG';
      showCelebrations = true;
    }
    //Process data
    currentZoom = GetZoom(currentZoom, colleagues);
    [celebrations, showShowMore, showCelebrations] = GetCelebrations(celebrationsListAmount, colleagues, currentZoom);
    [lateInvoiceList, isInvoicesEmpty] = GetLateInvoices(invoices, colleagues, currentZoom);
    crmScoreboard = GetScoreboard(crmScoreboard, clients, colleagues, currentZoom, invoices);
    [monthlyRevenueChart, lostRevenueChart] = GetChart(invoices, colleagues, currentZoom, upcoming_raw);
    oldURL = location.pathname;
    updateProcess();
  }
//});

  return (
    <>
    {/* Scoreboard */}
    <div>
      <dl className={scoreCardStyle}>
        {crmScoreboard.map((item) => (
          <div
            key={item.id}
            className="relative bg-white pt-5 px-4  sm:pt-6 sm:px-6 shadow rounded-lg overflow-hidden"
          >
            <dt>
              <p className="text-sm font-medium text-gray-500 truncate">{item.name}</p>
            </dt>
            <dd className="pb-6 flex items-baseline sm:pb-7">
              <p className="mt-1 text-3xl font-semibold text-gray-900">{item.stat}</p>
		
              <div className="absolute bottom-0 inset-x-0 px-4 sm:px-6">
                <div className="text-sm">
                <p
                className={classNames(
                  item.changeType === 'increase' ? 'text-green-600' : 'text-red-600',
                  'pb-1.5 ml-1 flex items-baseline text-sm font-semibold'
                )}
              >
            {(function(){
              if(item.changeShow === 'true'){ 
                if(item.changeType === 'increase' && !item.reverse){
                  return <ArrowSmUpIcon
                    className="-ml-1 mr-0.5 flex-shrink-0 self-center h-5 w-5 text-green-500"
                    aria-hidden="true"
                  />
                }
                else if(item.changeType === 'increase' && item.reverse){
                  return <ArrowSmDownIcon
                    className="-ml-1 mr-0.5 flex-shrink-0 self-center h-5 w-5 text-green-500"
                    aria-hidden="true"
                  />
                }
                else if(item.changeType === 'decrease' && !item.reverse){
                  return <ArrowSmDownIcon
                    className="-ml-1 mr-0.5 flex-shrink-0 self-center h-5 w-5 text-red-500"
                    aria-hidden="true"
                  />
                }
                else if(item.changeType === 'decrease' && item.reverse){
                  return <ArrowSmUpIcon
                    className="-ml-1 mr-0.5 flex-shrink-0 self-center h-5 w-5 text-red-500"
                    aria-hidden="true"
                  />
                }
              }
            })()}
                  <span className="sr-only">{item.changeType === 'increase' ? 'Increased' : 'Decreased'} by</span>
                  {item.change}
              </p>
                </div>
              </div>
						
            </dd>
          </div>
        ))}
      </dl>
    </div>

{/* Monthly & Lost Revenue Charts  */}
    {monthlyRevenueChart && <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-1 scorecard:grid-cols-2">
      <div className="shadow rounded-lg bg-white p-4">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-xl font-semibold text-gray-900">Monthly Revenue</h1>
          </div>
        </div>
      <ReactEcharts option={monthlyRevenueChart} />
      </div>

      <div className="shadow rounded-lg bg-white p-4">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-xl font-semibold text-gray-900">Lost Revenue</h1>
          </div>
        </div>
      <ReactEcharts option={lostRevenueChart} />
      </div>
    </div>}


    {!isInvoicesEmpty && showCelebrations ? <div className="grid grid-cols-1 gap-5 sm:grid-cols-1 scorecard:grid-cols-2">
        {/* Celebrations  */}
{showCelebrations === true &&
<div className="flex flex-col">
      <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
          <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-base text-[#222D38] font-semibold line-height: 2rem tracking-wider"
                  >
                    Celebrations
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-gray-200">
                {celebrations.map((person) => (
                  <tr key={person.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img className="object-cover h-10 w-10 rounded-full" src={person.image_url} alt="" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-[#222D38]">{person.name}</div>
                          <div className="text-xs text-[#617080]">{person.pretext}</div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
		{showShowMore === true &&
		  <button
        	    type="button"
		    onClick = {() => {celebrationsListAmount += 5; [celebrations, showShowMore, showCelebrations] = GetCelebrations(celebrationsListAmount, colleagues, currentZoom); updateProcess();}}
        	    className="m-4 inline-flex items-center p-0 border-transparent text-sm font-medium text-show-more-blue bg-transparent border: 0px hover:underline"
      		  >
        	    <p>Show More</p>
      		  </button>
	        }
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  }

{/* Late Invoices */}
{isInvoicesEmpty === false && <div className="mt-2 sm:px-2 lg:px-0">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">Late paid invoices: missing action</h1>
        </div>
      </div>
      <div className="mt-4 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-3 py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                      Invoice Code
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Sent Date
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Name
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Team
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {lateInvoiceList.map((person) => (
                    <tr key={person.code}>
                      <td className="whitespace-nowrap px-3 py-4 pl-4 text-sm text-gray-500 sm:pl-6"><button className="hover:underline" onClick={() => handleInvoiceClick(person.code_url)}>{person.code}</button></td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{person.date}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{person.name}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{person.team}</td>
                    </tr>
                  ))}
                </tbody>
	      </table>
            </div>
          </div>
        </div>
      </div>
    </div>}
      </div>
:
<div className="grid grid-cols-1 gap-4">
      {/* Celebrations  */}
{showCelebrations === true &&
<div className="flex flex-col">
      <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
          <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-base text-[#222D38] font-semibold line-height: 2rem tracking-wider"
                  >
                    Celebrations
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-gray-200">
                {celebrations.map((person) => (
                  <tr key={person.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img className="object-cover h-10 w-10 rounded-full" src={person.image_url} alt="" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-[#222D38]">{person.name}</div>
                          <div className="text-xs text-[#617080]">{person.pretext}</div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
		{showShowMore === true &&
		  <button
        	    type="button"
		    onClick = {() => {celebrationsListAmount += 5; [celebrations, showShowMore, showCelebrations] = GetCelebrations(celebrationsListAmount, colleagues, currentZoom); updateProcess();}}
        	    className="m-4 inline-flex items-center p-0 border-transparent text-sm font-medium text-show-more-blue bg-transparent border: 0px hover:underline"
      		  >
        	    <p>Show More</p>
      		  </button>
	        }
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  }

{/* Late Invoices */}
{isInvoicesEmpty === false && <div className="mt-2 sm:px-2 lg:px-0">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">Late paid invoices: missing action</h1>
        </div>
      </div>
      <div className="mt-4 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-3 py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                      Invoice Code
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Sent Date
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Name
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Team
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {lateInvoiceList.map((person) => (
                    <tr key={person.code}>
                      <td className="whitespace-nowrap px-3 py-4 pl-4 text-sm text-gray-500 sm:pl-6"><button className="hover:underline" onClick={() => handleInvoiceClick(person.code_url)}>{person.code}</button></td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{person.date}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{person.name}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{person.team}</td>
                    </tr>
                  ))}
                </tbody>
	      </table>
            </div>
          </div>
        </div>
      </div>
    </div>}
    </div>
  }

    </>
  )
}

