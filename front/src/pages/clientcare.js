import React, { Fragment, useState } from 'react'
import { ArrowSmDownIcon, ArrowSmUpIcon } from '@heroicons/react/solid'
import { GetZoom } from './settings'
import { GetScoreboard, GetClientsTable, GetLostClientCharts, GetCCcharts, FilterCharts} from './clinetcarefunc'
import { useLocation, useNavigate } from 'react-router-dom';
import ReactEcharts from "echarts-for-react"; 
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/solid'



//CRM Scoreboard
var crmScoreboard = [
  {id:1, name:'Clients', stat:'', change:'', changeType: '', changeShow:"false", reverse: false },
  {id:2, name:'Lost Clients', stat:'', change:'', changeType: '', changeShow:"true", reverse: false},
  {id:3, name:'Multiple Services', stat:'', change: '', changeType: '',changeShow:"false", reverse: false},
  {id:4, name:'NPS', stat:'', change: '', changeType: '',changeShow:"false", reverse: false},
  ];
  var clients, lostClients, allColleagues, colleagues;
  //var urlList, upcoming, upcoming_raw, navigation;
  var currentZoom = 'Loading...';
  var url, multipleServicesPie, multipleServicesBar, multipleServicesBarAll, 
  lostClientsYearAll, lostClientsPerTeam, lostClientsPerPerson, npsPerTeamChart, 
  ClientsPerChart, npsAmountChart, clientsPerAll, clientsNPSPerAll, npsAmountChartAll, npsPieChart;
  var oldURL = '';
  var clientList = '';
  var showClientTableResponsible = false;
  const today = new Date(new Date().toDateString())  

  //MultiChart: variables
  let clientsCharts = [];
  let clientsTitles = [];
  let multipleServicesCharts = [];
  let multipleServicesTitles = [];
  let npsCharts = [];
  let npsTitles = [];
  let lostClientsCharts = [];
  let lostClientsTitles = [];
  let npsProsentageCharts = [];
  let npsProsentageTitles = [];


  //Table:  -----------------------------------------------------------------------------------------------------
  const useSortableData = (items, config = null) => {
    const [sortConfig, setSortConfig] = React.useState(config);
  
    const requestSort = (key) => {
      let direction = 'ascending';
      if (
        sortConfig &&
        sortConfig.key === key &&
        sortConfig.direction === 'ascending'
      ) {
        direction = 'descending';
      }
      setSortConfig({ key, direction });
    };

    //Set defult sorting
    if(sortConfig === null){
      requestSort('end_comp');
    }

    const sortedItems = React.useMemo(() => {
      let sortableItems = [...items];
      if (sortConfig !== null) {
        sortableItems.sort((a, b) => {
          if (a[sortConfig.key] < b[sortConfig.key]) {
            return sortConfig.direction === 'ascending' ? -1 : 1;
          }
          if (a[sortConfig.key] > b[sortConfig.key]) {
            return sortConfig.direction === 'ascending' ? 1 : -1;
          }
          return 0;
        });
      }
      return sortableItems;
    }, [items, sortConfig]);

    return { items: sortedItems, requestSort, sortConfig };
  };

  const SortingTable = (props) => {
    var icon = '';
    const { items, requestSort, sortConfig } = useSortableData(props.content);
    const getClassNamesFor = (name) => {
      if (!sortConfig) {
        icon = <ArrowSmDownIcon className="h-5 w-5 inline invisible " aria-hidden="true" />
        return;
      }
      if(sortConfig.key === name && sortConfig.direction !== 'ascending'){
        icon = <ArrowSmUpIcon className="h-5 w-5 inline" aria-hidden="true" />
      }
      else if(sortConfig.key === name && sortConfig.direction !== 'descending'){
        icon = <ArrowSmDownIcon className="h-5 w-5 inline" aria-hidden="true" />
      }
      else{
        icon = <ArrowSmDownIcon className="h-5 w-5 inline invisible " aria-hidden="true" />
      }
      return sortConfig.key === name ? sortConfig.direction : undefined;
    };
    let navigate = useNavigate();
    return (
      <table className="min-w-full divide-y divide-gray-300">
        <thead className="bg-gray-50">
          <tr>
            <th scope='col' className='text-left pl-2 py-3.5'>
              <button
                type="button"
                onClick={() => requestSort('name')}
                className={classNames(getClassNamesFor('name'),"text-left text-sm font-semibold text-gray-900 group inline-flex hover:underline")}
              >
                Name{icon}
              </button>
            </th>
            { !showClientTableResponsible && <th scope='col' className='text-left pl-2 py-3.5 '>
              <button
                type="button"
                onClick={() => requestSort('responsible')}
                className={classNames(getClassNamesFor('responsible'),"text-left text-sm font-semibold text-gray-900 group inline-flex hover:underline")}
              >
                Responsible{icon}
              </button>
            </th>}
            { !showClientTableResponsible && <th scope='col' className='text-left pl-2 py-3.5'>
              <button
                type="button"
                onClick={() => requestSort('country')}
                className={classNames(getClassNamesFor('country'),"text-left text-sm font-semibold text-gray-900 group inline-flex hover:underline")}
              >
                Country{icon}
              </button>
            </th>}
            <th scope='col' className='text-left pl-2 py-3.5'>
              <button
                type="button"
                onClick={() => requestSort('end_comp')}
                className={classNames(getClassNamesFor('end_comp'),"text-left text-sm font-semibold text-gray-900 group inline-flex hover:underline")}
              >
                End{icon}
              </button>
            </th>
            <th scope='col' className='text-left pl-2 py-3.5'>
              <button
                type="button"
                onClick={() => requestSort('evaluation_comp')}
                className={classNames(getClassNamesFor('evaluation_comp'),"text-left text-sm font-semibold text-gray-900 group inline-flex hover:underline")}
              >
                Evaluation{icon}
              </button>
            </th>
            <th scope='col' className='text-left pl-2 py-3.5'>
              <button
                type="button"
                onClick={() => requestSort('renewal_comp')}
                className={classNames(getClassNamesFor('renewal_comp'),"text-left text-sm font-semibold text-gray-900 group inline-flex hover:underline")}
                >
                Renewal{icon}
              </button>
            </th>
            <th scope='col' className='text-left pl-2 py-3.5'>
              <button
                type="button"
                onClick={() => requestSort('scale_comp')}
                className={classNames(getClassNamesFor('scale_comp'),"text-left text-sm font-semibold text-gray-900 group inline-flex hover:underline")}
              >
                Scale{icon}
              </button>
            </th>
            <th scope='col' className='text-left pl-2 py-3.5'>
              <button
                type="button"
                onClick={() => requestSort('reference')}
                className={classNames(getClassNamesFor('reference'),"text-left text-sm font-semibold text-gray-900 group inline-flex hover:underline")}
              >
                Reference{icon}
              </button>
            </th>
            <th scope='col' className='text-left pl-2 py-3.5'>
              <button
                type="button"
                onClick={() => requestSort('nps_comp')}
                className={classNames(getClassNamesFor('nps_comp'),"text-left text-sm font-semibold text-gray-900 group inline-flex hover:underline")}
              >
                NPS{icon}
              </button>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {items.map((person) => (
            <tr key={person.code} className="hover:bg-gray-50">
            <td className="whitespace-nowrap pl-2 py-2 text-sm text-gray-500"><button 
                                    type='button'
                                    className="hover:underline"
                                    onClick={()=>{ navigate(person.href, {replace:false}); }}
                                    >{person.display_name}</button></td>
            { !showClientTableResponsible && <td className="whitespace-nowrap pl-2 py-2 text-sm text-gray-500">{person.responsible}</td>}
            { !showClientTableResponsible && <td className="whitespace-nowrap pl-2 py-2 text-sm text-gray-500">{person.country}</td>}
            { (person.end_comp < today || isNaN(person.end_comp)) ? <td className="whitespace-nowrap pl-2 py-2 text-sm text-red-700">{person.end}</td> : <td className="whitespace-nowrap pl-2 py-2 text-sm text-gray-500">{person.end}</td>}
            { (person.evaluation_comp < today || isNaN(person.evaluation_comp)) ? <td className="whitespace-nowrap pl-2 py-2 text-sm text-red-700">{person.evaluation}</td> : <td className="whitespace-nowrap pl-2 py-2 text-sm text-gray-500">{person.evaluation}</td>}
            { (person.renewal_comp < today || isNaN(person.renewal_comp)) ? <td className="whitespace-nowrap pl-2 py-2 text-sm text-red-700">{person.renewal}</td> : <td className="whitespace-nowrap pl-2 py-2 text-sm text-gray-500">{person.renewal}</td>}
            <td className="whitespace-nowrap pl-2 py-2 text-sm text-gray-500">{person.scale}</td>
            <td className="whitespace-nowrap pl-2 py-2 text-sm text-gray-500">{person.reference}</td>
            {(person.nps >= 9) ? <td className="whitespace-nowrap pl-2 py-2 text-sm text-natural-900">{person.nps}</td> : (person.nps <= 6) ? <td className="whitespace-nowrap pl-2 py-2 text-sm text-red-700">{person.nps}</td>  : <td className="whitespace-nowrap pl-2 py-2 text-sm text-yellow-600">{person.nps}</td> }
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  //        -----------------------------------------------------------------------------------------------------
function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function ClientCare (props){
  //invoices = props['values'][1];
  colleagues = props['values'][0]; 
  clients = props['values'][2];
  //navigation = props['values'][3];
  lostClients = props['values'][4];
  //urlList = props['values'][5];
  allColleagues = props['values'][6];
  //upcoming = props['values'][7];
  //upcoming_raw = props['values'][8];

  //React router
  let location = useLocation();
  //Update/re-render function
  const [update, done] = useState(false)
  const updateProcess = () => done(update => !update)

  //MultiChart: Define Chart Number states
  const [clinetsChartNumber, setClinetsChartNumber] = useState(0);
  const [multipleServicesChartNumber, setMultipleServicesChartNumber] = useState(0);
  const [npsChartNumber, setNPSChartNumber] = useState(0);
  const [lostClinetsChartNumber, setLostClinetsChartNumber] = useState(0);
  const [npsProsentageChartNumber, setNPSProsentageChartNumber] = useState(0);


  showClientTableResponsible = false;
  url = location['pathname'].split('/').filter(function(entry) { return entry.trim() !== ''; });
  if(url.length === 4){
    currentZoom = url[2].split('-').map(word => {
        return word.charAt(0).toUpperCase() + word.slice(1);
      }).join(' ');
      showClientTableResponsible = true;
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
    crmScoreboard = GetScoreboard(crmScoreboard, clients, colleagues, currentZoom, lostClients, allColleagues);
    [clientList, multipleServicesPie, multipleServicesBar, multipleServicesBarAll] = GetClientsTable(currentZoom, clients, colleagues);
    [lostClientsYearAll, lostClientsPerPerson, lostClientsPerTeam] = GetLostClientCharts(lostClients, currentZoom, colleagues, allColleagues);
    [npsPerTeamChart, ClientsPerChart, npsAmountChart, clientsPerAll, clientsNPSPerAll, npsAmountChartAll, npsPieChart] = GetCCcharts(currentZoom, clients, colleagues);

    //MultiChart: Update Charts
    [clientsTitles, clientsCharts] = FilterCharts(0, currentZoom, [ClientsPerChart, clientsPerAll]);
    setClinetsChartNumber(0);
    [multipleServicesTitles, multipleServicesCharts] = FilterCharts(1, currentZoom, [multipleServicesBar, multipleServicesBarAll]);
    setMultipleServicesChartNumber(0);
    [npsTitles, npsCharts] = FilterCharts(2, currentZoom, [npsPerTeamChart, clientsNPSPerAll]);
    setNPSChartNumber(0);
    [lostClientsTitles, lostClientsCharts] = FilterCharts(3, currentZoom, [lostClientsPerTeam, lostClientsPerPerson]);
    setLostClinetsChartNumber(0);
    [npsProsentageTitles, npsProsentageCharts] = FilterCharts(4, currentZoom, [npsAmountChart, npsAmountChartAll]);
    setNPSProsentageChartNumber(0);

    oldURL = location.pathname;
    updateProcess();
  }

  return (
    <>
              {/* Scoreboard */}
              <div>
                <dl className="mb-5 grid grid-cols-1 gap-5 sm:grid-cols-4 scorecard:grid-cols-4">
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

              {/* Charts */}
              <div className="mb-5 grid grid-cols-1 gap-5 charts:grid-cols-2">
                { multipleServicesPie && <div>
                  <div className='shadow rounded-lg bg-white p-4 h-full'>
                    <div className="sm:flex sm:items-center">
                      <div className="sm:flex-auto">
                        <h1 className="text-xl font-semibold text-gray-900">Client maturity</h1>
                      </div>
                    </div>
                    <ReactEcharts option={multipleServicesPie} />
                  </div>
                </div>}

                { npsPieChart && <div>
                  <div className='shadow rounded-lg bg-white p-4 h-full'>
                    <div className="sm:flex sm:items-center">
                      <div className="sm:flex-auto">
                        <h1 className="text-xl font-semibold text-gray-900">NPS per client</h1>
                      </div>
                    </div>
                    <ReactEcharts option={npsPieChart} />
                  </div>
                </div>}

                { clientsCharts.length !== 0 && <div>
                  <div className='shadow rounded-lg bg-white p-4 h-full'>
                    <div>
                      <div className="grid grid-cols-3">
                        <h1 className="flex col-span-2 place-content-start text-xl font-semibold text-gray-900">{clientsTitles[clinetsChartNumber]}</h1>
                        {clientsCharts.length > 1 && <div className="flex place-content-end">
                          {clinetsChartNumber <= 0 ? <button
                            onClick={() => setClinetsChartNumber(clinetsChartNumber - 1)}
                            disabled={true}
                            className="relative max-h-arrowbox ml-1.5 px-2 py-2 rounded-md border border-gray-300 text-sm font-medium text-gray-500 bg-white opacity-50"
                          >
                            <span className="sr-only">Previous</span>
                            <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
                          </button> : <button
                            onClick={() => setClinetsChartNumber(clinetsChartNumber - 1)}
                            disabled={false}
                            className="relative max-h-arrowbox ml-1.5 px-2 py-2 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                          >
                            <span className="sr-only">Previous</span>
                            <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
                          </button>}
                          {clinetsChartNumber + 1 >= clientsCharts.length ? <button
                            onClick={() => setClinetsChartNumber(clinetsChartNumber + 1)}
                            disabled={true}
                            className="relative max-h-arrowbox ml-1.5 px-2 py-2 rounded-md border border-gray-300 text-sm font-medium text-gray-500 bg-white opacity-50"
                          >
                            <span className="sr-only">Next</span>
                            <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
                          </button> : <button
                            onClick={() => setClinetsChartNumber(clinetsChartNumber + 1)}
                            disabled={false}
                            className="relative max-h-arrowbox ml-1.5 px-2 py-2 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                          >
                            <span className="sr-only">Next</span>
                            <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
                          </button>}
                        </div>}
                      </div>
                    </div>
                    <ReactEcharts option={clientsCharts[clinetsChartNumber]} notMerge={true}/>
                  </div>
                </div>}

                { npsProsentageCharts.length !== 0 && <div>
                  <div className='shadow rounded-lg bg-white p-4 h-full'>
                    <div>
                      <div className="grid grid-cols-3">
                        <h1 className="flex col-span-2 place-content-start text-xl font-semibold text-gray-900">{npsProsentageTitles[npsProsentageChartNumber]}</h1>
                        {npsProsentageCharts.length > 1 && <div className="flex place-content-end">
                          {npsProsentageChartNumber <= 0 ? <button
                            onClick={() => setNPSProsentageChartNumber(npsProsentageChartNumber - 1)}
                            disabled={true}
                            className="relative max-h-arrowbox ml-1.5 px-2 py-2 rounded-md border border-gray-300 text-sm font-medium text-gray-500 bg-white opacity-50"
                          >
                            <span className="sr-only">Previous</span>
                            <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
                          </button> : <button
                            onClick={() => setNPSProsentageChartNumber(npsProsentageChartNumber - 1)}
                            disabled={false}
                            className="relative max-h-arrowbox ml-1.5 px-2 py-2 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                          >
                            <span className="sr-only">Previous</span>
                            <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
                          </button>}
                          {npsProsentageChartNumber + 1 >= npsProsentageCharts.length ? <button
                            onClick={() => setNPSProsentageChartNumber(npsProsentageChartNumber + 1)}
                            disabled={true}
                            className="relative max-h-arrowbox ml-1.5 px-2 py-2 rounded-md border border-gray-300 text-sm font-medium text-gray-500 bg-white opacity-50"
                          >
                            <span className="sr-only">Next</span>
                            <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
                          </button> : <button
                            onClick={() => setNPSProsentageChartNumber(npsProsentageChartNumber + 1)}
                            disabled={false}
                            className="relative max-h-arrowbox ml-1.5 px-2 py-2 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                          >
                            <span className="sr-only">Next</span>
                            <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
                          </button>}
                        </div>}
                      </div>
                    </div>
                    <ReactEcharts option={npsProsentageCharts[npsProsentageChartNumber]} notMerge={true}/>
                  </div>
                </div>}
                
                { npsCharts.length !== 0 && <div>
                  <div className='shadow rounded-lg bg-white p-4 h-full'>
                    <div>
                      <div className="grid grid-cols-3">
                        <h1 className="flex col-span-2 place-content-start text-xl font-semibold text-gray-900">{npsTitles[npsChartNumber]}</h1>
                        {npsCharts.length > 1 && <div className="flex place-content-end">
                          {npsChartNumber <= 0 ? <button
                            onClick={() => setNPSChartNumber(npsChartNumber - 1)}
                            disabled={true}
                            className="relative max-h-arrowbox ml-1.5 px-2 py-2 rounded-md border border-gray-300 text-sm font-medium text-gray-500 bg-white opacity-50"
                          >
                            <span className="sr-only">Previous</span>
                            <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
                          </button> : <button
                            onClick={() => setNPSChartNumber(npsChartNumber - 1)}
                            disabled={false}
                            className="relative max-h-arrowbox ml-1.5 px-2 py-2 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                          >
                            <span className="sr-only">Previous</span>
                            <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
                          </button>}
                          {npsChartNumber + 1 >= npsCharts.length ? <button
                            onClick={() => setNPSChartNumber(npsChartNumber + 1)}
                            disabled={true}
                            className="relative max-h-arrowbox ml-1.5 px-2 py-2 rounded-md border border-gray-300 text-sm font-medium text-gray-500 bg-white opacity-50"
                          >
                            <span className="sr-only">Next</span>
                            <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
                          </button> : <button
                            onClick={() => setNPSChartNumber(npsChartNumber + 1)}
                            disabled={false}
                            className="relative max-h-arrowbox ml-1.5 px-2 py-2 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                          >
                            <span className="sr-only">Next</span>
                            <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
                          </button>}
                        </div>}
                      </div>
                    </div>
                    <ReactEcharts option={npsCharts[npsChartNumber]} notMerge={true}/>
                  </div>
                </div>}

                { lostClientsYearAll && <div>
                  <div className='shadow rounded-lg bg-white p-4 h-full'>
                    <div className="sm:flex sm:items-center">
                      <div className="sm:flex-auto">
                        <h1 className="text-xl font-semibold text-gray-900">Lost clients per year</h1>
                      </div>
                    </div>
                    <ReactEcharts option={lostClientsYearAll} />
                  </div>
                </div>}

                { lostClientsCharts.length !== 0 && <div>
                  <div className='shadow rounded-lg bg-white p-4 h-full'>
                    <div>
                      <div className="grid grid-cols-3">
                        <h1 className="flex col-span-2 place-content-start text-xl font-semibold text-gray-900">{lostClientsTitles[lostClinetsChartNumber]}</h1>
                        {lostClientsCharts.length > 1 && <div className="flex place-content-end">
                          {lostClinetsChartNumber <= 0 ? <button
                            onClick={() => setLostClinetsChartNumber(lostClinetsChartNumber - 1)}
                            disabled={true}
                            className="relative max-h-arrowbox ml-1.5 px-2 py-2 rounded-md border border-gray-300 text-sm font-medium text-gray-500 bg-white opacity-50"
                          >
                            <span className="sr-only">Previous</span>
                            <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
                          </button> : <button
                            onClick={() => setLostClinetsChartNumber(lostClinetsChartNumber - 1)}
                            disabled={false}
                            className="relative max-h-arrowbox ml-1.5 px-2 py-2 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                          >
                            <span className="sr-only">Previous</span>
                            <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
                          </button>}
                          {lostClinetsChartNumber + 1 >= lostClientsCharts.length ? <button
                            onClick={() => setLostClinetsChartNumber(lostClinetsChartNumber + 1)}
                            disabled={true}
                            className="relative max-h-arrowbox ml-1.5 px-2 py-2 rounded-md border border-gray-300 text-sm font-medium text-gray-500 bg-white opacity-50"
                          >
                            <span className="sr-only">Next</span>
                            <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
                          </button> : <button
                            onClick={() => setLostClinetsChartNumber(lostClinetsChartNumber + 1)}
                            disabled={false}
                            className="relative max-h-arrowbox ml-1.5 px-2 py-2 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                          >
                            <span className="sr-only">Next</span>
                            <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
                          </button>}
                        </div>}
                      </div>
                    </div>
                    <ReactEcharts option={lostClientsCharts[lostClinetsChartNumber]} notMerge={true}/>
                  </div>
                </div>}

                { multipleServicesCharts.length !== 0 && <div>
                  <div className='shadow rounded-lg bg-white p-4 h-full'>
                    <div>
                      <div className="grid grid-cols-3">
                        <h1 className="flex col-span-2 place-content-start text-xl font-semibold text-gray-900">{multipleServicesTitles[multipleServicesChartNumber]}</h1>
                        {multipleServicesCharts.length > 1 && <div className="flex place-content-end">
                          {multipleServicesChartNumber <= 0 ? <button
                            onClick={() => setMultipleServicesChartNumber(multipleServicesChartNumber - 1)}
                            disabled={true}
                            className="relative max-h-arrowbox ml-1.5 px-2 py-2 rounded-md border border-gray-300 text-sm font-medium text-gray-500 bg-white opacity-50"
                          >
                            <span className="sr-only">Previous</span>
                            <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
                          </button> : <button
                            onClick={() => setMultipleServicesChartNumber(multipleServicesChartNumber - 1)}
                            disabled={false}
                            className="relative max-h-arrowbox ml-1.5 px-2 py-2 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                          >
                            <span className="sr-only">Previous</span>
                            <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
                          </button>}
                          {multipleServicesChartNumber + 1 >= multipleServicesCharts.length ? <button
                            onClick={() => setMultipleServicesChartNumber(multipleServicesChartNumber + 1)}
                            disabled={true}
                            className="relative max-h-arrowbox ml-1.5 px-2 py-2 rounded-md border border-gray-300 text-sm font-medium text-gray-500 bg-white opacity-50"
                          >
                            <span className="sr-only">Next</span>
                            <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
                          </button> : <button
                            onClick={() => setMultipleServicesChartNumber(multipleServicesChartNumber + 1)}
                            disabled={false}
                            className="relative max-h-arrowbox ml-1.5 px-2 py-2 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                          >
                            <span className="sr-only">Next</span>
                            <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
                          </button>}
                        </div>}
                      </div>
                    </div>
                    <ReactEcharts option={multipleServicesCharts[multipleServicesChartNumber]} notMerge={true}/>
                  </div>
                </div>}

              </div>

          
              {/* Client Table */}
              { clientList.length !== 0 && <div className="mt-2 sm:pl-2 lg:px-0">
                    <div className="sm:flex sm:items-center">
                      <div className="sm:flex-auto">
                        <h1 className="text-xl font-semibold text-gray-900">Clients</h1>
                      </div>
                    </div>
                    <div className="mt-4 flex flex-col">
                      <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
                        <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                          <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                            {/* --------------------------------------- */}
                            <SortingTable
                              content = {clientList}
                            />
                            {/* --------------------------------------- */}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>}
    </>
  )
}