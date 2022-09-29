import React, { Fragment, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { SidebarSettings, UpdateSidebarSettings, FetchData, GetZoom } from './settings'
import { MenuIcon, XIcon } from '@heroicons/react/outline'
import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom"
import { Overview, ClientCare, NotFound, ClientsPage, FinancesPage } from "./"
import { GetLateInvoices, GetNotifications  } from './notificationsfunc'

//Tree menu setup
import TreeMenu, { ItemComponent } from "react-simple-tree-menu"
import "../../src/tree.css"

var tabs = [
  { name: 'Overview', href: '', current: false },
  { name: 'ClientCare', href: '/clientcare', current: false },
  { name: 'Finances', href: '/finances', current: false },

]

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

let notificationsList = [[],[]];
let lateInvoiceNumber;

var [currentZoom, oldURL, url, topBarTitle, baseURL, currentTab, topBarImage] = '';
var showTopBarImage = false;
var showTopBar = true;
var loadingNow = true;
var rawClients;
var [colleagues, invoices, clients, lostClients, urlList, allColleagues, upcoming, upcoming_raw, notifications] = '';
var navigation = SidebarSettings();

export default function Sidebar() {
var treeOpenNode = [];

let navigate = useNavigate();
let location = useLocation();

if(location.pathname === '/feedback' || location.pathname.includes('/clients/')){
  showTopBar = false;
}
else{
  showTopBar = true;
}

url = location['pathname'].split('/').filter(function(entry) { return entry.trim() !== ''; });
if(location.pathname.includes('/clientcare')|| location.pathname.includes('/finances')){
  url.pop();
}
if(url.length === 3){
  currentZoom = url[2].split('-').map(word => {
      return word.charAt(0).toUpperCase() + word.slice(1);
    }).join(' ');
  treeOpenNode = [url[0].replaceAll('-',' '), (url[0].replaceAll('-',' ') + '/' + url[1].replaceAll('-',' ')) ];
}
else if(url.length === 2){
  currentZoom = url[1].split('-').map(word => {
      return word.charAt(0).toUpperCase() + word.slice(1);
    }).join(' ');
  treeOpenNode = [url[0].replaceAll('-',' ')];
}
else{
  currentZoom = 'ORG';
}

[baseURL, tabs, currentTab] = getBaseURL(location, tabs);
var treeActiveKey = url.join('/');
treeActiveKey = treeActiveKey.replaceAll('-',' ');
//States
//Sidebar & Dropdown states
const [sidebarOpen, setSidebarOpen] = useState(false)

//Update/re-render function
const [update, done] = useState(false);
const [data, setData] = useState(navigation);
const [openNodes, setOpenNodes] = useState(treeOpenNode);
const updateProcess = () => done(update => !update);
								
//React.useEffect(() => {
  //console.log("outside Check");
  if(!colleagues  && !invoices && !clients && !rawClients && !lostClients && !allColleagues && !upcoming && !upcoming_raw){
    //console.log('in fetch');
    loadingNow = true;
    var allData = FetchData().then(allData =>{
      //console.log(allData);
      colleagues = allData.colleagues;
      invoices = allData.invoices;
      clients = allData.clients;
      rawClients = allData.clients;
      lostClients = allData.lost_clients;
      allColleagues = allData.all_colleagues;
      upcoming = allData.upcoming;
      upcoming_raw = allData['upcoming_raw'];
      notifications = allData.notifications;
      [navigation, urlList] = UpdateSidebarSettings(navigation, colleagues);
      currentZoom = GetZoom(currentZoom, colleagues);
      topBarTitle = currentZoom;
      showTopBarImage = false;
      for(let counter = 0; counter < colleagues.length; counter++){
        if(colleagues[counter]['name'] === topBarTitle){
          showTopBarImage = true;
          topBarImage = colleagues[counter]['image_url'];
        }
      }
      oldURL = location.pathname;
      loadingNow = false;
      lateInvoiceNumber = GetLateInvoices(currentZoom, invoices, colleagues);
      notificationsList = GetNotifications(currentZoom, notifications, lateInvoiceNumber, colleagues);
      updateProcess();
    }).catch(err => {
          console.log('Error: ',err);
          loadingNow = true;
    });
  }
  else if(oldURL !== location.pathname){
    currentZoom = GetZoom(currentZoom, colleagues);
    topBarTitle = currentZoom;
    showTopBarImage = false;
    for(let counter = 0; counter < colleagues.length; counter++){
      if(colleagues[counter]['name'] === topBarTitle){
        showTopBarImage = true;
        topBarImage = colleagues[counter]['image_url'];
      }
    }
    oldURL = location.pathname;
    lateInvoiceNumber = GetLateInvoices(currentZoom, invoices, colleagues);
    notificationsList = GetNotifications(currentZoom, notifications, lateInvoiceNumber, colleagues);
    updateProcess();
  }
//});
								
  return (
    <>
      <div>
        <Transition.Root show={sidebarOpen} as={Fragment}>
          <Dialog as="div" className="fixed inset-0 flex z-40 md:hidden" onClose={setSidebarOpen}>
            <Transition.Child
              as={Fragment}
              enter="transition-opacity ease-linear duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="transition-opacity ease-linear duration-300"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Dialog.Overlay className="fixed inset-0 bg-gray-600 bg-opacity-75" />
            </Transition.Child>
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <div className="relative flex-1 flex flex-col max-w-xs w-full bg-gray-800">
                <Transition.Child
                  as={Fragment}
                  enter="ease-in-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in-out duration-300"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <div className="absolute top-0 right-0 -mr-12 pt-2">
                    <button
                      type="button"
                      className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                      onClick={() => setSidebarOpen(false)}
                    >
                      <span className="sr-only">Close sidebar</span>
                      <XIcon className="h-6 w-6 text-white" aria-hidden="true" />
                    </button>
                  </div>
                </Transition.Child>
                <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
                  <div className="flex-shrink-0 flex items-center px-4">
                    <a href="/org"><h1 className='text-white font-semibold'>ORG</h1></a>
                  </div>
                  <nav className="mt-5 px-2 space-y-1">
				                    
                      <TreeMenu
                        initialActiveKey = {treeActiveKey}
                        initialOpenNodes = {treeOpenNode}
		 	                  data = {data}
                       	resetOpenNodesOnDataUpdate = {false}
			                  disableKeyboard = {true}
                       	onClickItem = {({...props}) => {
                          if(props.href === '/feedback'){
                            navigate(props.href, {replace:false});
                          }
                          else{
                            navigate(props.href + currentTab, {replace:false});
                          }
                        }}
                    >
                        {({ items }) => (
                          <ul className="tree-item-group list-none text-base font-medium rounded-md">
                            {items.map(({ key, url, ...props }) => (
			      <ItemComponent key={key} {...props}/>
                            ))}
                          </ul>
                        )}
                     </TreeMenu>
						  
                  </nav>
                </div>
                {/* <div className="flex-shrink-0 flex bg-gray-700 p-4">
                  <a href="#" className="flex-shrink-0 group block">
                    <div className="flex items-center">
                      <div>
                        <img
                          className="inline-block h-10 w-10 rounded-full"
                          src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                          alt=""
                        />
                      </div>
                      <div className="ml-3">
                        <p className="text-base font-medium text-white">Tom Cook</p>
                        <p className="text-sm font-medium text-gray-400 group-hover:text-gray-300">View profile</p>
                      </div>
                    </div>
                  </a>
                </div> */}
              </div>
            </Transition.Child>
            <div className="flex-shrink-0 w-14">{/* Force sidebar to shrink to fit close icon */}</div>
          </Dialog>
        </Transition.Root>

        {/* Static sidebar for desktop */}
        <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
          {/* Sidebar component, swap this element with another sidebar if you like */}
          <div className="flex-1 flex flex-col min-h-0 bg-gray-800">
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              <div className="flex items-center flex-shrink-0 px-4">
                <a href="/org"><h1 className='text-white font-semibold'>ORG</h1></a>
              </div>
              <nav className="mt-5 flex-1 px-2 space-y-1">
							
                <TreeMenu
                  initialActiveKey = {treeActiveKey}
                  initialOpenNodes = {openNodes}
		              resetOpenNodesOnDataUpdate = {false}
                  data = {data}
	                onClickItem = {({...props }) => {
                    if(props.href === '/feedback'){
                      navigate(props.href, {replace:false});
                    }
                    else{
                      navigate(props.href + currentTab, {replace:false});
                    }
		  }}
                >
                  {({ items }) => (
                    <ul className="tree-item-group list-none text-base font-medium rounded-md">
                      {items.map(({ key, url, ...props }) => (
                        <ItemComponent key={key} {...props}/>
                      ))}
                    </ul>
                  )}
                </TreeMenu>
							
	      </nav>
            </div>
            {/* <div className="flex-shrink-0 flex bg-gray-700 p-4">
              <a href="#" className="flex-shrink-0 w-full group block">
                <div className="flex items-center">
                  <div>
                    <img
                      className="inline-block h-9 w-9 rounded-full"
                      src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                      alt=""
                    />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-white">Tom Cook</p>
                    <p className="text-xs font-medium text-gray-300 group-hover:text-gray-200">View profile</p>
                  </div>
                </div>
              </a>
            </div> */}
          </div>
        </div>
        <div className="md:pl-64 flex flex-col flex-1">
          <div className="sticky top-0 z-10 md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3 bg-gray-100">
            <button
              type="button"
              className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
              onClick={() => setSidebarOpen(true)}
            >
              <span className="sr-only">Open sidebar</span>
              <MenuIcon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>

      <div>
        <main className="flex-1">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
            {loadingNow === true && <div>
              <h1 className="text-2xl place-content-center font-semibold text-gray-900 mb-8">Loading...</h1>
            </div>}
      
      
      {loadingNow === false && <div>
        {showTopBar && <div className="shadow rounded-lg bg-white p-4 mb-6  grid grid-cols-1 gap-5 sm:grid-cols-1 lg:grid-cols-2">
          <div className="flex place-content-center lg:place-content-start">
            { showTopBarImage && <img 
              className="object-cover mr-2 h-10 w-10 rounded-full"
              src = {topBarImage}
              alt=""
            />}
            <h1 className="mt-2 text-xl font-semibold text-gray-900">{topBarTitle}</h1>
          </div>
      <div>
        <nav className="grid grid-cols-2 place-content-center lg:place-content-end lg:space-x-4 sm_menu:flex sm_menu:space-x-4" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              type='button'
              key={tab.name}
              onClick={() => {
                  navigate(baseURL + tab.href, {replace:false});
              }}
              className={classNames(
                tab.current ? 'bg-gray-100 text-gray-700' : 'text-gray-500 hover:text-gray-700',
                'px-3 py-2 font-medium text-base rounded-md'
              )}
              aria-current={tab.current ? 'page' : undefined}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </div>
    </div>}
    {/* Notifications */}
    {notificationsList[0].length > 0 && <div className='drop-shadow-lg rounded-lg bg-white p-4 mb-6'>
      <div className="grid grid-cols-6">
          <h1 className='flex col-span-5 place-content-start my-auto text-xl font-semibold text-gray-900'> {notificationsList[0][0]} </h1>
          <button
            onClick={() => {NotificationAction(notificationsList); updateProcess();}}
            className="relative col-span-1 place-content-end my-auto max-h-arrowbox p-2 rounded-md border border-gray-300 bg-white font-medium text-gray-500 hover:bg-gray-50"
          >
            <span className="text-md font-semibold text-gray-900">{notificationsList[1][0]}</span>
          </button>
        </div>
    </div>}

      <Routes>
        <Route path="/" element={<Navigate to="/org" replace />} />
	      <Route path = "/" >
	        <Route path="feedback" element={<Feedback />} />
          <Route path="org" element={<Overview values={[colleagues, invoices, clients, navigation, lostClients, urlList, allColleagues, upcoming, upcoming_raw]}/>} />
          <Route path="org/:team" element={<Overview values={[colleagues, invoices, clients, navigation, lostClients, urlList, allColleagues, upcoming, upcoming_raw]}/>} />
          <Route path="org/:team/:name" element={<Overview values={[colleagues, invoices, clients, navigation, lostClients, urlList, allColleagues, upcoming, upcoming_raw]}/>} />
          <Route path="org/clientcare" element={<ClientCare values={[colleagues, invoices, clients, navigation, lostClients, urlList, allColleagues, upcoming, upcoming_raw]}/>} />
          <Route path="org/:team/clientcare" element={<ClientCare values={[colleagues, invoices, clients, navigation, lostClients, urlList, allColleagues, upcoming, upcoming_raw]}/>} />
          <Route path="org/:team/:name/clientcare" element={<ClientCare values={[colleagues, invoices, clients, navigation, lostClients, urlList, allColleagues, upcoming, upcoming_raw]}/>} />
          <Route path="org/finances" element={<FinancesPage values={[colleagues, invoices, clients, navigation, lostClients, urlList, allColleagues, upcoming, upcoming_raw]}/>} />
          <Route path="org/:team/finances" element={<FinancesPage values={[colleagues, invoices, clients, navigation, lostClients, urlList, allColleagues, upcoming, upcoming_raw]}/>} />
          <Route path="org/:team/:name/finances" element={<FinancesPage values={[colleagues, invoices, clients, navigation, lostClients, urlList, allColleagues, upcoming, upcoming_raw]}/>} />
          <Route path="clients/:client" element={<ClientsPage values={[colleagues, invoices, clients, navigation, lostClients, urlList, allColleagues, upcoming, upcoming_raw]}/>} />
	        <Route path="*" element={NotFound} />
        </Route>
      </Routes>
                {/* /End replace */}
          </div>}
        </div>
      </div>
      </main>
      </div>
      </div>
      </div>
    </>
  )
}


function Feedback(){
  return(
    <div className="flex-1 max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
      <iframe title="Google-Form" src="https://docs.google.com/forms/d/e/1FAIpQLSdMzlSThst9sH-PxaeS7put08wqIWudHFx0CDBsvunEits07w/viewform?embedded=true" width="700" height="900" frameborder="0" marginheight="0" marginwidth="0">Loading…</iframe>
    </div>
  );
}

function getBaseURL(location, tabb){
  var realUrl = location['pathname'].split('/').filter(function(entry) { return entry.trim() !== ''; });
  if(location.pathname.includes('/clientcare')){
    currentTab = '/clientcare'
    if(realUrl.length === 4){
      realUrl =  '/' + realUrl[0] + '/' + realUrl[1] + '/' + realUrl[2];
    }
    else if(realUrl.length === 3){
      realUrl =  '/' + realUrl[0] + '/' + realUrl[1];
    }
    else if(realUrl.length === 2){
      realUrl =  '/' + realUrl[0];
    }
  }
  else if(location.pathname.includes('/finances')){
    currentTab = '/finances'
    if(realUrl.length === 4){
      realUrl =  '/' + realUrl[0] + '/' + realUrl[1] + '/' + realUrl[2];
    }
    else if(realUrl.length === 3){
      realUrl =  '/' + realUrl[0] + '/' + realUrl[1];
    }
    else if(realUrl.length === 2){
      realUrl =  '/' + realUrl[0];
    }
  }
  else{
    currentTab = '';
    if(realUrl.length === 3){
      realUrl =  '/' + realUrl[0] + '/' + realUrl[1] + '/' + realUrl[2];
    }
    else if(realUrl.length === 2){
      realUrl =  '/' + realUrl[0] + '/' + realUrl[1];
    }
    else if(realUrl.length === 1){
      realUrl =  '/' + realUrl[0];
    }
  }
  for(let counter = 0; counter < tabb.length; counter++){
    if(tabb[counter]['href'] === currentTab){
      tabb[counter]['current'] = true;
    }
    else{
      tabb[counter]['current'] = false;
    }

  }
  return [realUrl, tabb, currentTab];
}

async function NotificationAction(){
  let base = window.location.protocol + "//" + window.location.host.slice(0, -1) + '9';
  let sendURL;
  if(String(window.location).includes('localhost:')){
    sendURL = base + '/back/notification-update';
  }
  else{
    sendURL = '/back/notification-update';
  }
  if(notificationsList[1][0] === 'Done'){
    fetch(sendURL, {
      method: "POST",
      headers: {"Content-Type": "application/JSON"},
      body: JSON.stringify({message: notificationsList[0][0], person: notificationsList[2][0], id: notificationsList[3][0]}) 
    })
  }
  notificationsList[1].shift();
  notificationsList[0].shift();
}