import React, { Fragment, useState } from 'react'
import ReactEcharts from "echarts-for-react"; 
import { ArrowSmDownIcon, ArrowSmUpIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/solid'
import { GetZoom } from './settings'
import { GetScorecards, GetChart, GetLateInvoices, FilterCharts } from './financesfunc';
import { useLocation } from 'react-router-dom';
//CRM Scoreboard
var scorecards = [
    {id:1, name:'Revenue', stat:'', change:'', changeType: '', changeShow:"true", reverse: false },
    {id:2, name:'Lost Revenue', stat:'', change:'', changeType: '', changeShow:"true", reverse: false },
    {id:3, name:'Confirmed', stat:'', change:'', changeType: '', changeShow:"true", reverse: false },
    {id:4, name:'Upcoming', stat:'', change:'', changeType: '', changeShow:"true", reverse: false },

];

//Variables
var url, currentZoom, colleagues, invoices, upcoming_raw, lateInvoiceList, 
monthlyRevenueChart, lostRevenueChart, nextMonthRevenueChart, currentMonthUpcomingRevenueChart,
latePaidAllRevenueChart, latePaidRevenueChart, quarterlyRevenueChart, yearlyRevenueChart, 
lateSendRevenueChart, allLateSendRevenueChart, allNextMonthRevenueChart;
var oldURL = '';

//MultiChart: variables
let currentYearRevenueCharts = [];
let currentYearRevenueTitles = [];
let yearlyRevenueCharts = [];
let yearlyRevenueTitles = [];
let nextMonthRevenueCharts = [];
let nextMonthRevenueTitles = [];
let latePaidRevenueCharts = [];
let latePaidRevenueTitles = [];
let lateSendRevenueCharts = [];
let lateSendRevenueTitles = [];

function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
  }
  
  export default function FinancesPage (props){
    //Passed Props
    //console.log(props);
    colleagues = props['values'][0]; 
    invoices = props['values'][1];
    //clients = props['values'][2];
    //navigation = props['values'][3];
    //lostClients = props['values'][4];
    //urlList = props['values'][5];
    //allColleagues = props['values'][6];
    //upcoming = props['values'][7];
    upcoming_raw = props['values'][8];
    //React router
    let location = useLocation();
    //let navigate = useNavigate();

    //MultiChart: Define Chart Number states
    const [currentYearRevenueChartNumber, setCurrentYearRevenueChartNumber] = useState(0);
    const [yearlyRevenueChartNumber, setYearlyRevenueChartNumber] = useState(0);
    const [nextMonthRevenueChartNumber, setNextMonthRevenueChartNumber] = useState(0);
    const [latePaidRevenueChartNumber, setLatePaidRevenueChartNumber] = useState(0);
    const [lateSendRevenueChartNumber, setLateSendRevenueChartNumber] = useState(0);

    
    //Update/re-render function
    const [update, done] = useState(false)
    const updateProcess = () => done(update => !update)

    //Handle invoice link clicks
    const handleInvoiceClick = (invURL) => {
        window.open(invURL);
    };

    url = location['pathname'].split('/').filter(function(entry) { return entry.trim() !== ''; });
    if(url.length === 4){
        currentZoom = url[2].split('-').map(word => {
            return word.charAt(0).toUpperCase() + word.slice(1);
        }).join(' ');
    }
    else if(url.length === 3){
        currentZoom = url[1].split('-').map(word => {
            return word.charAt(0).toUpperCase() + word.slice(1);
        }).join(' ');
    }
    else{
        currentZoom = 'ORG';
    }


    if(oldURL !== location.pathname){
      //Actions
      currentZoom = GetZoom(currentZoom, colleagues);
      scorecards = GetScorecards(scorecards, currentZoom, invoices, colleagues, upcoming_raw);
      lateInvoiceList = GetLateInvoices(invoices, colleagues, currentZoom);
      [monthlyRevenueChart, lostRevenueChart, nextMonthRevenueChart, currentMonthUpcomingRevenueChart,
        latePaidAllRevenueChart, latePaidRevenueChart, quarterlyRevenueChart, yearlyRevenueChart, 
        lateSendRevenueChart, allLateSendRevenueChart, allNextMonthRevenueChart] = GetChart(invoices, colleagues, currentZoom, upcoming_raw);

      //MultiChart: Update Charts
      [currentYearRevenueTitles, currentYearRevenueCharts] = FilterCharts(0, currentZoom, [monthlyRevenueChart, currentMonthUpcomingRevenueChart]);
      setCurrentYearRevenueChartNumber(0);
      [yearlyRevenueTitles, yearlyRevenueCharts] = FilterCharts(1, currentZoom, [quarterlyRevenueChart, yearlyRevenueChart]);
      setYearlyRevenueChartNumber(0);
      [nextMonthRevenueTitles, nextMonthRevenueCharts] = FilterCharts(2, currentZoom, [nextMonthRevenueChart, allNextMonthRevenueChart]);
      setNextMonthRevenueChartNumber(0);
      [latePaidRevenueTitles, latePaidRevenueCharts] = FilterCharts(3, currentZoom, [latePaidRevenueChart, latePaidAllRevenueChart]);
      setLatePaidRevenueChartNumber(0);
      [lateSendRevenueTitles, lateSendRevenueCharts] = FilterCharts(4, currentZoom, [lateSendRevenueChart, allLateSendRevenueChart]);
      setLateSendRevenueChartNumber(0);

      oldURL = location.pathname;
      updateProcess();
    }
    return (
        <>
        {/* Info Cards */}
        <div>
            <dl className="mb-5 grid grid-cols-1 gap-5 sm:grid-cols-4">
                {scorecards.map((item) => (
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

            {/* Charts: */}
            <div className="mb-5 grid grid-cols-1 gap-5 charts:grid-cols-2">

            { currentYearRevenueCharts.length !== 0 && <div>
                  <div className='shadow rounded-lg bg-white p-4 h-full'>
                    <div>
                      <div className="grid grid-cols-3">
                        <h1 className="flex col-span-2 place-content-start text-xl font-semibold text-gray-900">{currentYearRevenueTitles[currentYearRevenueChartNumber]}</h1>
                        {currentYearRevenueCharts.length > 1 && <div className="flex place-content-end">
                          {currentYearRevenueChartNumber <= 0 ? <button
                            onClick={() => setCurrentYearRevenueChartNumber(currentYearRevenueChartNumber - 1)}
                            disabled={true}
                            className="relative max-h-arrowbox ml-1.5 px-2 py-2 rounded-md border border-gray-300 text-sm font-medium text-gray-500 bg-white opacity-50"
                          >
                            <span className="sr-only">Previous</span>
                            <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
                          </button> : <button
                            onClick={() => setCurrentYearRevenueChartNumber(currentYearRevenueChartNumber - 1)}
                            disabled={false}
                            className="relative max-h-arrowbox ml-1.5 px-2 py-2 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                          >
                            <span className="sr-only">Previous</span>
                            <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
                          </button>}
                          {currentYearRevenueChartNumber + 1 >= currentYearRevenueCharts.length ? <button
                            onClick={() => setCurrentYearRevenueChartNumber(currentYearRevenueChartNumber + 1)}
                            disabled={true}
                            className="relative max-h-arrowbox ml-1.5 px-2 py-2 rounded-md border border-gray-300 text-sm font-medium text-gray-500 bg-white opacity-50"
                          >
                            <span className="sr-only">Next</span>
                            <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
                          </button> : <button
                            onClick={() => setCurrentYearRevenueChartNumber(currentYearRevenueChartNumber + 1)}
                            disabled={false}
                            className="relative max-h-arrowbox ml-1.5 px-2 py-2 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                          >
                            <span className="sr-only">Next</span>
                            <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
                          </button>}
                        </div>}
                      </div>
                    </div>
                    <ReactEcharts option={currentYearRevenueCharts[currentYearRevenueChartNumber]} notMerge={true}/>
                  </div>
                </div>}

                { yearlyRevenueCharts.length !== 0 && <div>
                  <div className='shadow rounded-lg bg-white p-4 h-full'>
                    <div>
                      <div className="grid grid-cols-3">
                        <h1 className="flex col-span-2 place-content-start text-xl font-semibold text-gray-900">{yearlyRevenueTitles[yearlyRevenueChartNumber]}</h1>
                        {yearlyRevenueCharts.length > 1 && <div className="flex place-content-end">
                          {yearlyRevenueChartNumber <= 0 ? <button
                            onClick={() => setYearlyRevenueChartNumber(yearlyRevenueChartNumber - 1)}
                            disabled={true}
                            className="relative max-h-arrowbox ml-1.5 px-2 py-2 rounded-md border border-gray-300 text-sm font-medium text-gray-500 bg-white opacity-50"
                          >
                            <span className="sr-only">Previous</span>
                            <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
                          </button> : <button
                            onClick={() => setYearlyRevenueChartNumber(yearlyRevenueChartNumber - 1)}
                            disabled={false}
                            className="relative max-h-arrowbox ml-1.5 px-2 py-2 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                          >
                            <span className="sr-only">Previous</span>
                            <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
                          </button>}
                          {yearlyRevenueChartNumber + 1 >= yearlyRevenueCharts.length ? <button
                            onClick={() => setYearlyRevenueChartNumber(yearlyRevenueChartNumber + 1)}
                            disabled={true}
                            className="relative max-h-arrowbox ml-1.5 px-2 py-2 rounded-md border border-gray-300 text-sm font-medium text-gray-500 bg-white opacity-50"
                          >
                            <span className="sr-only">Next</span>
                            <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
                          </button> : <button
                            onClick={() => setYearlyRevenueChartNumber(yearlyRevenueChartNumber + 1)}
                            disabled={false}
                            className="relative max-h-arrowbox ml-1.5 px-2 py-2 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                          >
                            <span className="sr-only">Next</span>
                            <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
                          </button>}
                        </div>}
                      </div>
                    </div>
                    <ReactEcharts option={yearlyRevenueCharts[yearlyRevenueChartNumber]} notMerge={true}/>
                  </div>
                </div>}

                { nextMonthRevenueCharts.length !== 0 && <div>
                  <div className='shadow rounded-lg bg-white p-4 h-full'>
                    <div>
                      <div className="grid grid-cols-3">
                        <h1 className="flex col-span-2 place-content-start text-xl font-semibold text-gray-900">{nextMonthRevenueTitles[nextMonthRevenueChartNumber]}</h1>
                        {nextMonthRevenueCharts.length > 1 && <div className="flex place-content-end">
                          {nextMonthRevenueChartNumber <= 0 ? <button
                            onClick={() => setNextMonthRevenueChartNumber(nextMonthRevenueChartNumber - 1)}
                            disabled={true}
                            className="relative max-h-arrowbox ml-1.5 px-2 py-2 rounded-md border border-gray-300 text-sm font-medium text-gray-500 bg-white opacity-50"
                          >
                            <span className="sr-only">Previous</span>
                            <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
                          </button> : <button
                            onClick={() => setNextMonthRevenueChartNumber(nextMonthRevenueChartNumber - 1)}
                            disabled={false}
                            className="relative max-h-arrowbox ml-1.5 px-2 py-2 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                          >
                            <span className="sr-only">Previous</span>
                            <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
                          </button>}
                          {nextMonthRevenueChartNumber + 1 >= nextMonthRevenueCharts.length ? <button
                            onClick={() => setNextMonthRevenueChartNumber(nextMonthRevenueChartNumber + 1)}
                            disabled={true}
                            className="relative max-h-arrowbox ml-1.5 px-2 py-2 rounded-md border border-gray-300 text-sm font-medium text-gray-500 bg-white opacity-50"
                          >
                            <span className="sr-only">Next</span>
                            <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
                          </button> : <button
                            onClick={() => setNextMonthRevenueChartNumber(nextMonthRevenueChartNumber + 1)}
                            disabled={false}
                            className="relative max-h-arrowbox ml-1.5 px-2 py-2 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                          >
                            <span className="sr-only">Next</span>
                            <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
                          </button>}
                        </div>}
                      </div>
                    </div>
                    <ReactEcharts option={nextMonthRevenueCharts[nextMonthRevenueChartNumber]} notMerge={true}/>
                  </div>
                </div>}

                { lostRevenueChart && <div>
                  <div className='shadow rounded-lg bg-white p-4 h-full'>
                    <div className="sm:flex sm:items-center">
                      <div className="sm:flex-auto">
                        <h1 className="text-xl font-semibold text-gray-900">Lost Revenue</h1>
                      </div>
                    </div>
                    <ReactEcharts option={lostRevenueChart} />
                  </div>
                </div>}

                { latePaidRevenueCharts.length !== 0 && <div>
                  <div className='shadow rounded-lg bg-white p-4 h-full'>
                    <div>
                      <div className="grid grid-cols-3">
                        <h1 className="flex col-span-2 place-content-start text-xl font-semibold text-gray-900">{latePaidRevenueTitles[latePaidRevenueChartNumber]}</h1>
                        {latePaidRevenueCharts.length > 1 && <div className="flex place-content-end">
                          {latePaidRevenueChartNumber <= 0 ? <button
                            onClick={() => setLatePaidRevenueChartNumber(latePaidRevenueChartNumber - 1)}
                            disabled={true}
                            className="relative max-h-arrowbox ml-1.5 px-2 py-2 rounded-md border border-gray-300 text-sm font-medium text-gray-500 bg-white opacity-50"
                          >
                            <span className="sr-only">Previous</span>
                            <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
                          </button> : <button
                            onClick={() => setLatePaidRevenueChartNumber(latePaidRevenueChartNumber - 1)}
                            disabled={false}
                            className="relative max-h-arrowbox ml-1.5 px-2 py-2 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                          >
                            <span className="sr-only">Previous</span>
                            <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
                          </button>}
                          {latePaidRevenueChartNumber + 1 >= latePaidRevenueCharts.length ? <button
                            onClick={() => setLatePaidRevenueChartNumber(latePaidRevenueChartNumber + 1)}
                            disabled={true}
                            className="relative max-h-arrowbox ml-1.5 px-2 py-2 rounded-md border border-gray-300 text-sm font-medium text-gray-500 bg-white opacity-50"
                          >
                            <span className="sr-only">Next</span>
                            <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
                          </button> : <button
                            onClick={() => setLatePaidRevenueChartNumber(latePaidRevenueChartNumber + 1)}
                            disabled={false}
                            className="relative max-h-arrowbox ml-1.5 px-2 py-2 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                          >
                            <span className="sr-only">Next</span>
                            <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
                          </button>}
                        </div>}
                      </div>
                    </div>
                    <ReactEcharts option={latePaidRevenueCharts[latePaidRevenueChartNumber]} notMerge={true}/>
                  </div>
                </div>}

                { lateSendRevenueCharts.length !== 0 && <div>
                  <div className='shadow rounded-lg bg-white p-4 h-full'>
                    <div>
                      <div className="grid grid-cols-3">
                        <h1 className="flex col-span-2 place-content-start text-xl font-semibold text-gray-900">{lateSendRevenueTitles[lateSendRevenueChartNumber]}</h1>
                        {lateSendRevenueCharts.length > 1 && <div className="flex place-content-end">
                          {lateSendRevenueChartNumber <= 0 ? <button
                            onClick={() => setLateSendRevenueChartNumber(lateSendRevenueChartNumber - 1)}
                            disabled={true}
                            className="relative max-h-arrowbox ml-1.5 px-2 py-2 rounded-md border border-gray-300 text-sm font-medium text-gray-500 bg-white opacity-50"
                          >
                            <span className="sr-only">Previous</span>
                            <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
                          </button> : <button
                            onClick={() => setLateSendRevenueChartNumber(lateSendRevenueChartNumber - 1)}
                            disabled={false}
                            className="relative max-h-arrowbox ml-1.5 px-2 py-2 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                          >
                            <span className="sr-only">Previous</span>
                            <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
                          </button>}
                          {lateSendRevenueChartNumber + 1 >= lateSendRevenueCharts.length ? <button
                            onClick={() => setLateSendRevenueChartNumber(lateSendRevenueChartNumber + 1)}
                            disabled={true}
                            className="relative max-h-arrowbox ml-1.5 px-2 py-2 rounded-md border border-gray-300 text-sm font-medium text-gray-500 bg-white opacity-50"
                          >
                            <span className="sr-only">Next</span>
                            <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
                          </button> : <button
                            onClick={() => setLateSendRevenueChartNumber(lateSendRevenueChartNumber + 1)}
                            disabled={false}
                            className="relative max-h-arrowbox ml-1.5 px-2 py-2 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                          >
                            <span className="sr-only">Next</span>
                            <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
                          </button>}
                        </div>}
                      </div>
                    </div>
                    <ReactEcharts option={lateSendRevenueCharts[lateSendRevenueChartNumber]} notMerge={true}/>
                  </div>
                </div>}
            </div>
        
        {/* Late Invoices */}
        {lateInvoiceList && <div className="mt-2 sm:px-2 lg:px-0">
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
        </>
    )
}