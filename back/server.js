//Setup express & google API
const express = require("express")
var bodyParser = require('body-parser')
var jsonParser = bodyParser.json()
var cors = require('cors')
const res = require("express/lib/response")
const {google} = require('googleapis')
process.env.NODE_ENV='config';
const config = require('config').get(__dirname.split("/")[3]);
const api = express()
const app = express()
const client_port = config.get('client_port');
const api_port = config.get('api_port');
const path = require('path');
const fs = require('fs');
const Axios = require('axios');
const credPath = __dirname + '/secret/credentials.json';
app.use(cors())
api.use(cors())

//Google sheets IDs: Finance, Personalcare, CRM
const gSheets = [
  ['1q0xQlpadb9RfUDO11MUSW7h2eXwyuXk5E1k09goTPeQ', '17JXwCISkWb-49HYcH1GrYF782Y9toAh8NJPoQzAzwJE', '1Mj5QtLdKBpbhMLxFnFtQok2lzoR0lyPII1IzUlPyh8w', '1AXbUFA5C7zeg2SLKtlwktbu69yNpyoFTAhArgXZzVec' ],
  ['Invoices','Colleagues', 'Clients', 'Lost', 'Upcoming', 'All Colleagues', 'Notifications' ],
  //['0', 2104432162],
  ['ROWS','COLUMNS']
];


//Variables
var invoiceSheetData, arrayInvoiceData, colleagueSheetData, arrayColleagueData;
var invoiceData = [];
var colleagueData = [];
var substituteArray = [];
var imgPath = [];
var photoID = [];
var birthdate = '';

//Notifications
let notificationSheetData, arrayNotificationData;
let notificationData = [];

//CRM Clients
var clientsSheetData,arrayClientsData;
var clientsData = [];

//CRM Lost Clients
var lostClientsSheetData,arrayLostClientsData;
var lostClientsData = [];

//CRM All Colleagues
var aColleaguesSheetData, arrayAColleaguesData;
var aColleaguesData =[];

//Upcoming
var upcomingSheetData, arrayUpcomingData;
var upcomingData =[];

var startDate;
var listOfMonths = ['January', 'February', 'March','April', 'May',
'June', 'July', 'August', 'September', 'October', 'November', 'December'];

//Refresh Interval
setInterval(function() {
    refreshInvoices(res, false);
    refreshColleagues(res, false);
    refreshClients(res, false);
    refreshLostClients(res, false);
    refreshAllColleagues(res, false);
    refreshUpcoming(res, false);
    refreshNotifications(res, false);
}, 60 * 1000); // 60 * 1000 milsec


//Get ID from url post
function getID(url){
  var urlID;
  if(url == null){
    url = ''
  }
  if(url.includes('id=') === true ){
    if(url.includes('&') === true && url.includes('itsnotthatkind') === true){
      urlID  = url.substring(
      url.indexOf('='),
      url.lastIndexOf('&a')
      );
      urlID = urlID.slice(1);
    }
    else if(url.includes('&') === true){
      urlID  = url.substring(
      url.indexOf('d/'),
      url.lastIndexOf('&a')
      );
    }
    else{
      urlID = url.split('id=').pop();
    }
  }
  else if(url === ''){
    urlID = '1ktEpKEPPL-lN_6BA-XZ6s2-2caba4w-j'
  }
  else{
    urlID = url.split('/d/').pop();
    urlID = urlID.split('/view')[0];
  }
//console.log(urlID);
return urlID;
}


//Pull Data From Google Sheets
async function sheetsRefresh(currentID, currentSheet, currentDimension) {
  //console.log("refresh data");
  try {
    const {
      sheets
    } = await authentication('sheets');

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: currentID,
      range: currentSheet,
      majorDimension: currentDimension
    })
    //console.log(response.data);
    return response.data;

  } catch (e) {
    console.log(e);
    return e;
  }
}

//Append Data to Google Sheets
async function AppendSheet(currentID, currentSheet, dataValues) {
  try {
    const {
      sheets
    } = await authentication('sheets');

    await sheets.spreadsheets.values.append({
      spreadsheetId: currentID,
      range: currentSheet,
      valueInputOption: "RAW",
      resource: {
        values: [dataValues]
      }
    })
    //Write Command:
    //   await AppendSheet(gSheets[0][3], gSheets[1][6], ['1','Worker 3', 'No', 'Neutral','','Test Message',]);
  } catch (e) {
    console.log(e);
    return e;
  }
}

//Update Data to Google Sheets
async function UpdateSheet(currentID, currentSheet, rangeSpecification, dataValues) {
  try {
    const {
      sheets
    } = await authentication('sheets');

    const result = await sheets.spreadsheets.values.update({
      spreadsheetId: currentID,
      range: currentSheet + '!' + rangeSpecification,
      valueInputOption: "RAW",
      resource: {
        values: [dataValues]
      }
    })
    //console.log('!' + rangeSpecification);
    //console.log('%d cells updated.', result.data.updatedCells);
    //Write Command:
    //   await UpdateSheet(gSheets[0][3], gSheets[1][6], '3:3', ['1','Worker 3', 'No', 'Neutral','','Test Message',]);
  } catch (e) {
    console.log(e);
    return e;
  }
}


//Google Sheets Auth settings
const authentication = async (service) => {
  var scope;
  //console.log(service);
  const auth = new google.auth.GoogleAuth({
    keyFile: credPath,
    scopes: "https://www.googleapis.com/auth/spreadsheets"
  });
  const client = await auth.getClient();
  const sheets = google.sheets({
    version: 'v4',
    auth: client
  });
  //console.log('in sheets');
  scope = "https://www.googleapis.com/auth/spreadsheets";
  return {sheets}
}
// ---------------------------------------------------------------------------------------													
//Pull data from Invoice Sheet
async function refreshInvoices(ress, run) {
  //console.log("Refrehing Sheets data")
  invoiceSheetData = await sheetsRefresh(gSheets[0][0], gSheets[1][0], gSheets[2][0]);
  //Reset data if there is previous data
  var invoiceData = [];
  arrayInvoiceData = '';
  //Format
  arrayInvoiceData = Object.values(invoiceSheetData);
  for (let number = 1; number < arrayInvoiceData[2].length; number++) {
    //Filter invoices & force 11 array length
    if (arrayInvoiceData[2][number].length > 5 && arrayInvoiceData[2][number][0] != '') {
      while (arrayInvoiceData[2][number].length <= 9) {
        arrayInvoiceData[2][number].push("");
      }

      //To remove sheets read-error with long notes counting as more then one array entry
      if (arrayInvoiceData[2][number].length > 9) {
        substituteArray = arrayInvoiceData[2][number].slice(8);
        arrayInvoiceData[2][number][10] = substituteArray.join(" ");
        arrayInvoiceData[2][number] = arrayInvoiceData[2][number].slice(0, 9);
      }
      //Format revenue to usable form & if empty fill it with 0
      arrayInvoiceData[2][number][3] = arrayInvoiceData[2][number][3].replaceAll('€', '');
      arrayInvoiceData[2][number][3] = arrayInvoiceData[2][number][3].replaceAll(' ', '');
      arrayInvoiceData[2][number][3] = arrayInvoiceData[2][number][3].replaceAll('.', '');
      if (arrayInvoiceData[2][number][3] == "" || arrayInvoiceData[2][number][3] == " ") {
        arrayInvoiceData[2][number][3] = 0;
      }
      //1by1 json creation
      invoiceData.push({
        invoice_id: arrayInvoiceData[2][number][0],
        client: arrayInvoiceData[2][number][1],
        date: arrayInvoiceData[2][number][2],
        revenue: arrayInvoiceData[2][number][3],
        paid: arrayInvoiceData[2][number][4],
        responsible: arrayInvoiceData[2][number][5],
        area: arrayInvoiceData[2][number][6],
        deadline: arrayInvoiceData[2][number][7],
        notes: arrayInvoiceData[2][number][8]
      });
    }
  }
  invoiceData = {invoices: invoiceData};
  //console.log(invoiceData);
  //Print invoice data
  if(run === true){
  ress.end(JSON.stringify(invoiceData));
  }
  //return invoiceData;
}


//Pull data from Upcoming Sheet
async function refreshUpcoming(ress, run) {
  var rawData = [];
  var tempDate;
  var timeList = [];
  var invoices = [];
  let expectedAmount = 0;
  let sync = 0;
  //console.log("Refrehing Sheets data")
  upcomingSheetData = await sheetsRefresh(gSheets[0][0], gSheets[1][4], gSheets[2][0]);
  //Reset data if there is previous data
  upcomingData = [];
  
  arrayUpcomingData = Object.values(upcomingSheetData);
  arrayUpcomingData = arrayUpcomingData[2];
  //console.log(arrayUpcomingData);
  for(let counter = 1; counter < arrayUpcomingData.length; counter++){
      expectedAmount += parseFloat(arrayUpcomingData[counter][2].replaceAll('.','').replaceAll(' €',''));
      tempDate = arrayUpcomingData[counter][1].split('-');
      rawData.push({
        revenue: parseFloat(arrayUpcomingData[counter][2].replaceAll('.','').replaceAll(' €','')),
        send_date: tempDate[1] + '/' + tempDate[0] + '/20' + tempDate[2],
        responsible: arrayUpcomingData[counter][3],
        status: arrayUpcomingData[counter][7],
      });
  }
  invoices.push(expectedAmount);

  for(let counter = 0; counter < timeList.length; counter++){
    upcomingData.push({
      time: timeList[counter],
      expected: invoices[counter], 
    });
  }
  upcomingData = {upcoming_raw: rawData};
  //upcomingData = arrayUpcomingData;
  //Print Upcoming data
  if(run === true){
  ress.end(JSON.stringify(upcomingData));
  }
  //return upcomingData;
}


//Pull data from Colleagues CRM Sheet
async function refreshAllColleagues(ress, run) {  
  //console.log(gSheets[0][1], gSheets[1][5], gSheets[2][1]);
  aColleaguesSheetData = await sheetsRefresh(gSheets[0][1], gSheets[1][5], gSheets[2][1]);
  aColleaguesData = [];
  arrayAColleaguesData = Object.values(aColleaguesSheetData);
  arrayAColleaguesData = arrayAColleaguesData[2];
  let longestArray = 0;
  //Remove first entries (names for columns)
  for(let counter = 0; counter < arrayAColleaguesData.length; counter++){
    arrayAColleaguesData[counter].shift();
  }
  //Get & set highest array length  
  for(let counter = 0; counter < arrayAColleaguesData.length; counter++){
    if(arrayAColleaguesData[counter].length > longestArray){
      longestArray = arrayAColleaguesData[counter].length;
    }
  }
  //Make sure every column is same length
  for(let counter = 0; counter < arrayAColleaguesData.length; counter++){
    while(arrayAColleaguesData[counter].length <= longestArray){
      arrayAColleaguesData[counter].push('');
    }
  }
  //Push data to json format
  for(let counter = 0; counter < arrayAColleaguesData[0].length; counter++){
    if(arrayAColleaguesData[0][counter].length !== 0){
      aColleaguesData.push({
        name: arrayAColleaguesData[0][counter],
        start: arrayAColleaguesData[1][counter],
        end: arrayAColleaguesData[2][counter],
        team: arrayAColleaguesData[3][counter],
      });
    }
  }
  aColleaguesData = {all_colleagues: aColleaguesData};
  //aColleaguesData = arrayAColleaguesData;
  //aColleaguesData = arrayAColleaguesData;
  if(run === true){
    ress.end(JSON.stringify(aColleaguesData));
  }
}


//Pull data from Clients CRM Sheet
async function refreshClients(ress, run) {  
  clientsSheetData = await sheetsRefresh(gSheets[0][2], gSheets[1][2], gSheets[2][1]);
  clientsData = [];
  arrayClientsData = Object.values(clientsSheetData);
  arrayClientsData = arrayClientsData[2];
  let longestArray = 0;
  //Remove first entries (names for columns)
  for(let counter = 0; counter < arrayClientsData.length; counter++){
    //console.log(arrayClientsData[counter][0]);
    arrayClientsData[counter].shift();
  }
  //Get & set highest array length  
  for(let counter = 0; counter < arrayClientsData.length; counter++){
    if(arrayClientsData[counter].length > longestArray){
      longestArray = arrayClientsData[counter].length;
    }
  }

  for(let counter = 0; counter < arrayClientsData.length; counter++){
    while(arrayClientsData[counter].length <= longestArray){
      arrayClientsData[counter].push('');
    }
  }

  var tempAds = [];
  //Push data to json format
  for(let counter = 0; counter < arrayClientsData[0].length; counter++){
    if(arrayClientsData[1][counter] !== '' && arrayClientsData[0][counter] !== ''){
      tempAds.push({name: arrayClientsData[0][counter], ads: arrayClientsData[1][counter] });
    }
    if(arrayClientsData[0][counter].length !== 0){
      clientsData.push({
        name: arrayClientsData[0][counter],
        responsible: arrayClientsData[1][counter],
        delegated: arrayClientsData[2][counter],
        type: arrayClientsData[3][counter],
        language: arrayClientsData[4][counter],
        country: arrayClientsData[5][counter],
        city: arrayClientsData[6][counter],
        lead: arrayClientsData[7][counter],
        start: arrayClientsData[8][counter],
        end: arrayClientsData[9][counter],
        end_days: arrayClientsData[10][counter],
        evaluation: arrayClientsData[11][counter],
        renewal: arrayClientsData[12][counter],
        revenue: arrayClientsData[13][counter].replaceAll('.','').replaceAll('€',''),
        scale: arrayClientsData[14][counter],
        reference: arrayClientsData[15][counter],
        nps: arrayClientsData[16][counter],
      });
    }
  }
  //console.log(clientsData);
  //console.log(clientsData.clients.length);
  listOfCustomers = tempAds;
  clientsData = {clients: clientsData};
  //clientsData = arrayClientsData;
  if(run === true){
    ress.end(JSON.stringify(clientsData));
  }
}


//Pull data from Lost CRM Sheet
async function refreshLostClients(ress, run) {  
  lostClientsSheetData = await sheetsRefresh(gSheets[0][2], gSheets[1][3], gSheets[2][1]);
  lostClientsData = [];
  arrayLostClientsData = Object.values(lostClientsSheetData);
  arrayLostClientsData = arrayLostClientsData[2];
  let longestArray = 0;
  //Remove first entries (names for columns)
  for(let counter = 0; counter < arrayLostClientsData.length; counter++){
    arrayLostClientsData[counter].shift();
  }
  //Make sure every column is same length
  //Get & set highest array length  
  for(let counter = 0; counter < arrayLostClientsData.length; counter++){
    if(arrayLostClientsData[counter].length > longestArray){
      longestArray = arrayLostClientsData[counter].length;
    }
  }

  for(let counter = 0; counter < arrayLostClientsData.length; counter++){
    while(arrayLostClientsData[counter].length <= longestArray){
      arrayLostClientsData[counter].push('');
    }
  }

  //Push data to json format
  for(let counter = 0; counter < arrayLostClientsData[0].length; counter++){
    if(arrayLostClientsData[0][counter].length !== 0){
      lostClientsData.push({
        name: arrayLostClientsData[0][counter],
        contact: arrayLostClientsData[1][counter],
        delegated: arrayLostClientsData[2][counter],
        type: arrayLostClientsData[3][counter],
        language: arrayLostClientsData[4][counter],
        country: arrayLostClientsData[5][counter],
        city: arrayLostClientsData[6][counter],
        lead: arrayLostClientsData[7][counter],
        start: arrayLostClientsData[8][counter],
        end: arrayLostClientsData[9][counter],
      });
    }
  }
  lostClientsData = {lost_clients: lostClientsData};
  if(run === true){
    ress.end(JSON.stringify(lostClientsData));
  }
}


//Pull data from Colleagues Sheet
async function refreshColleagues(ress, run) {
  colleagueSheetData = await sheetsRefresh(gSheets[0][1], gSheets[1][1], gSheets[2][1]);
  colleagueData = [];
  photoID = [];
  arrayColleagueData = Object.values(colleagueSheetData);
  //console.log(arrayColleagueData);
  //console.log(arrayColleagueData[2][26]);
//  ress.write(arrayColleagueData[2][0][0].toLowerCase());
  for(let number = 1; number < arrayColleagueData[2][0].length; number++) {
    if(arrayColleagueData[2][0][number] && arrayColleagueData[2][9][number]){
      //Get URL:s IDs & Download images
      photoID.push('https://drive.google.com/thumbnail?id=' + getID(arrayColleagueData[2][11][number]));
      imgPath.push(path.join(__dirname, '../front/public/assets/personalcare/colleague-images/') + (number - 1) + '.jpg');

      //Create Birthdate Format: d m
      if(arrayColleagueData[2][10][number] == null){
        arrayColleagueData[2][10][number] = '';
      }
      if(arrayColleagueData[2][10][number] != ''){
        for(let counter = 0; counter < listOfMonths.length; counter++){
          if(arrayColleagueData[2][10][number].includes(listOfMonths[counter])){
            birthdate = arrayColleagueData[2][10][number].replace(listOfMonths[counter], '1');
          }
        }
      }
      else{
        birthdate = '';
      }


      //Create start date
      startDate = arrayColleagueData[2][1][number].substring(0,5).split('-').reverse();
      //console.log(startDate);
      startDate[0] = listOfMonths[(parseInt(startDate[0] - 1))];
      if(startDate[1].charAt(0) === '0'){
        //console.log('remove 0');
        startDate[1] = startDate[1].replace('0', '');
      }
      startDate = startDate.join(' ');

      //Make new array
      colleagueData.push({
      name: arrayColleagueData[2][0][number],
      start_year: '20' + arrayColleagueData[2][1][number].substring(6),
      start_date: startDate,
      team: arrayColleagueData[2][9][number],
      birthday: arrayColleagueData[2][10][number].split(' ').reverse().join(' '),
      birth_date: birthdate,
      image_url: photoID[number-1]
      });
    }
  }
  colleagueData = {colleagues: colleagueData};

  //Print colleagues data
  if(run === true){
    ress.end(JSON.stringify(colleagueData));
  }
}

async function refreshNotifications(ress, run) {
  notificationSheetData = await sheetsRefresh(gSheets[0][3], gSheets[1][6], gSheets[2][0]);
  notificationData = [];
  arrayNotificationData = Object.values(notificationSheetData);
  arrayNotificationData = arrayNotificationData[2];
  for(let counter = 1; counter < arrayNotificationData.length; counter++){
    if(arrayNotificationData[counter][0] && !arrayNotificationData[counter][3] && arrayNotificationData[counter][4]){
      notificationData.push({
        id: counter + 1,
        person: arrayNotificationData[counter][0],
        importance: arrayNotificationData[counter][1],
        nature: arrayNotificationData[counter][2],
        message: arrayNotificationData[counter][4]
      });
    }
  }
  notificationData = {notifications: notificationData};
  if(run === true){
    ress.end(JSON.stringify(notificationData));
  }
}

//Notification Mark Function
async function recieveNotificationUpdate(receivedData){
  for(let counter = 1; counter < arrayNotificationData.length; counter++){
    if(arrayNotificationData[counter][4] === receivedData.message && arrayNotificationData[counter][0] === receivedData.person){
      await UpdateSheet(gSheets[0][3], gSheets[1][6], 'D'+ parseInt(counter + 1), ['X']);
    }
  }
}


//Backend Responses
api.get('/back/invoices', (req, res) => {
  res.writeHead(200, {
    "Content-Type": "application/json"
  });
  if (invoiceData === undefined || invoiceData.length === 0){
    refreshInvoices(res, true);
  }else{
    res.end(JSON.stringify(invoiceData));
  }
})

api.get('/back/upcoming', (req, res) => {
  res.writeHead(200, {
    "Content-Type": "application/json"
  });
  if (upcomingData === undefined || upcomingData.length === 0){
    refreshUpcoming(res, true);
  }else{
    res.end(JSON.stringify(upcomingData));
  }
})

api.get('/back/colleagues', (req, res) => {
  res.writeHead(200, {
    "Content-Type": "application/json"
  });
  if (colleagueData === undefined || colleagueData.length === 0){
    refreshColleagues(res, true);
  }else{
    res.end(JSON.stringify(colleagueData));
  }
})

api.get('/back/clients', (req, res) => {
  res.writeHead(200, {
    "Content-Type": "application/json"
  });
  if (clientsData === undefined || clientsData.length === 0){
    refreshClients(res, true);
  }else{
    res.end(JSON.stringify(clientsData));
  }
})

api.get('/back/lost-clients', (req, res) => {
  res.writeHead(200, {
    "Content-Type": "application/json"
  });
  if (lostClientsData === undefined || lostClientsData.length === 0){
    refreshLostClients(res, true);
  }else{
    res.end(JSON.stringify(lostClientsData));
  }
})

api.get('/back/all-colleagues', (req, res) => {
  res.writeHead(200, {
    "Content-Type": "application/json"
  });
  if (aColleaguesData === undefined || aColleaguesData.length === 0){
    refreshAllColleagues(res, true);
  }else{
    res.end(JSON.stringify(aColleaguesData));
  }
})

api.get('/back/notifications', (req, res) => {
  res.writeHead(200, {
    "Content-Type": "application/json"
  });
  if (notificationData === undefined || notificationData.length === 0){
    refreshNotifications(res, true);
  }else{
    res.end(JSON.stringify(notificationData));
  }
})

api.post('/back/notification-update', jsonParser ,function (req, res){
  if (notificationData === undefined || notificationData.length === 0){
    refreshNotifications(res, false).then(() => {
      recieveNotificationUpdate(req.body);
      refreshNotifications(res, false);
    });
  }
  else{
    recieveNotificationUpdate(req.body);
    refreshNotifications(res, false);
  }
});


//Frontend render
app.get('*', function (req, res) {
  // console.log(__dirname + '../front/build' + req.url);
  //console.log(req.url);
  if(req.url.includes("/static/") || req.url.includes(".png") || req.url.includes(".json") || req.url.includes(".ico") || req.url.includes(".txt")){
    res.sendFile(path.join(__dirname, '../front/build', req.url));
  }
  else{
  res.sendFile(path.join(__dirname, '../front/build', 'index.html'));  
  }
});



//Listen ports 3000 & 3001
app.listen(client_port, () => {
console.log(`Listening on port ${client_port}`)
})
api.listen(api_port, () => {
console.log(`Listening on port ${api_port}`)
})
