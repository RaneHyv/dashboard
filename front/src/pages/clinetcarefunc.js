
//Scoreboard
export const GetScoreboard = (scoreboard, clients, colleagues, zoom, lostClients, allColleagues) => {
  var allPeopleList = [];
  var allStructureList = [];
  let numberOfClients = 0;
  let numberOfMSClients = 0;
  let previousNumberOfLostClients = 0;
  let currentNumberOfLostClients = 0;
  var oneYearAgo,tempDate;
  var thisYearS = new Date().getFullYear().toString().slice(-2);
  let thisYear = parseInt(thisYearS);

  //Get Average NPS
  var currentTeamZoomMembers = [];
  var tempCurrentTeamZoomMembers = colleagues.filter(function(value, index, arr){ 
    return value.team === zoom;
  });
  for(let counter = 0; counter < tempCurrentTeamZoomMembers.length; counter++){
    currentTeamZoomMembers.push(tempCurrentTeamZoomMembers[counter]['name'])
  }
  let sumNPS = 0;
  let numberOfNPS = 0;
  for(let counter = 0; counter < clients.length; counter++){
    if(clients[counter]['nps'] && (zoom === 'ORG' || zoom === clients[counter]['responsible'] || currentTeamZoomMembers.includes(clients[counter]['responsible']))){
      numberOfNPS++;
      sumNPS += parseInt(clients[counter]['nps']);
    }
  }
  //Calculate average NPS
  let averageNPS = (sumNPS / numberOfNPS).toFixed(1);
  if(isNaN(averageNPS)){
    averageNPS = 0;
  }
  

  //Get 1 year past date
  var today = new Date();
  var dd = String(today.getDate()).padStart(2, '0');
  var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
  var yyyy = today.getFullYear();

  oneYearAgo = new Date(mm + '/' + dd + '/' + (yyyy - 1));

  //Get Current Teams
  var teamList = [];
  for(let counter = 0; counter < colleagues.length;counter++){
    if(colleagues[counter]['team']){
      if(!teamList.includes(colleagues[counter]['team'])){
        teamList.push(colleagues[counter]['team']);
      }
    }
  }

  var peopleList = [];
  var structureList = [];

//Get current persons per current team 
  for(let counter = 0; counter < teamList.length; counter++){
    for(let sCounter = 0; sCounter < colleagues.length; sCounter++){
      if(colleagues[sCounter]['team'] === teamList[counter]){
        peopleList.push(colleagues[sCounter]['name']);
      }
    }
  structureList.push(peopleList);
  peopleList = [];
  }

//Get alltime persons per current teams
  for(let counter = 0; counter < teamList.length; counter++){
    for(let sCounter = 0; sCounter < allColleagues.length; sCounter++){
      if(allColleagues[sCounter]['team'] === teamList[counter]){
        allPeopleList.push(allColleagues[sCounter]['name']);
      }
    }
  allStructureList.push(allPeopleList);
  allPeopleList = [];
  }
    
//Get number of clients
  //ORG
  if(zoom === 'ORG'){
    numberOfClients = clients.length;
    for(let counter = 0; counter < clients.length; counter++){
      if(clients[counter]['revenue'] > 3500){
        numberOfMSClients++;
      }
    }
    for(let counter = 0; counter < lostClients.length; counter++){
      tempDate = lostClients[counter]['end'].split('-');
      if(new Date(tempDate[1] + '/' + tempDate[0] + '/' + tempDate[2]) <= oneYearAgo && parseInt(lostClients[counter]['end'].slice(-2)) === (thisYear - 1)){
        previousNumberOfLostClients++;
      }
      if(new Date(tempDate[1] + '/' + tempDate[0] + '/' + tempDate[2]) <= today && parseInt(lostClients[counter]['end'].slice(-2)) === thisYear){
        currentNumberOfLostClients++;
      }
    }
  }
  //Individual
  else if(!teamList.includes(zoom)){
    for(let counter = 0; counter < clients.length; counter++){
      if(zoom === clients[counter]['responsible']){
        numberOfClients++;
        if(clients[counter]['revenue'] > 3500){
          numberOfMSClients++;
        }
      }
    }
    for(let counter = 0; counter < lostClients.length; counter++){
      tempDate = lostClients[counter]['end'].split('-');
      if(new Date(tempDate[1] + '/' + tempDate[0] + '/' + tempDate[2]) <= oneYearAgo 
      && parseInt(lostClients[counter]['end'].slice(-2)) === (thisYear - 1)
      && zoom === lostClients[counter]['contact']){
        previousNumberOfLostClients++;
      }
      if(new Date(tempDate[1] + '/' + tempDate[0] + '/' + tempDate[2]) <= today 
      && parseInt(lostClients[counter]['end'].slice(-2)) === thisYear
      && zoom === lostClients[counter]['contact']){
        currentNumberOfLostClients++;
      }
    }
  }
  //Team
  else{
    for(let counter = 0; counter < teamList.length; counter++){
      if(zoom === teamList[counter]){
    for(let sCounter = 0; sCounter < clients.length; sCounter++){
       if(structureList[counter].includes(clients[sCounter]['responsible'])){
        numberOfClients++;
        if(clients[sCounter]['revenue'] > 3500){
              numberOfMSClients++;
            }
      }
        }
        for(let tCounter = 0; tCounter < lostClients.length; tCounter++){
          tempDate = lostClients[tCounter]['end'].split('-');
          if(new Date(tempDate[1] + '/' + tempDate[0] + '/' + tempDate[2]) <= oneYearAgo 
          && parseInt(lostClients[tCounter]['end'].slice(-2)) === (thisYear - 1)
          && allStructureList[counter].includes(lostClients[tCounter]['contact'])){
            previousNumberOfLostClients++;
          }
          if(new Date(tempDate[1] + '/' + tempDate[0] + '/' + tempDate[2]) <= today 
          && parseInt(lostClients[tCounter]['end'].slice(-2)) === thisYear
          && allStructureList[counter].includes(lostClients[tCounter]['contact'])){
            currentNumberOfLostClients++;
          }
        }
      }
    }
  }
  if(numberOfMSClients > 0){
    numberOfMSClients = Math.round(numberOfMSClients / numberOfClients * 100);
    scoreboard[2]['stat'] = numberOfMSClients + '%';
  }
  else{
    scoreboard[2]['stat'] = '0%';
  }

//Get % of lost clients  
  if(previousNumberOfLostClients !== 0){
    if(currentNumberOfLostClients > previousNumberOfLostClients){
      scoreboard[1]['changeType'] = 'decrease';
      scoreboard[1]['change'] = Math.round(((currentNumberOfLostClients - previousNumberOfLostClients) / previousNumberOfLostClients ) * 100) + '%';
    }
    else if(currentNumberOfLostClients < previousNumberOfLostClients){
      scoreboard[1]['changeType'] = 'increase';
      scoreboard[1]['change'] = '-' + Math.round(((previousNumberOfLostClients - currentNumberOfLostClients) / previousNumberOfLostClients ) * 100) + '%';
    }
    else if(currentNumberOfLostClients === previousNumberOfLostClients){
      scoreboard[1]['changeType'] = 'increase';
      scoreboard[1]['change'] = '0%';
    }
  }
  else{
    scoreboard[1]['changeType'] = 'increase';
    scoreboard[1]['change'] = '0%';
  }


//Update scoreboard
  scoreboard[0]['stat'] = numberOfClients;
  scoreboard[1]['stat'] = currentNumberOfLostClients;
  scoreboard[1]['reverse'] = true;
  scoreboard[3]['stat'] = averageNPS;
  return scoreboard;
}


function formatRevenue(revenue){
  revenue = revenue.toString();
  if(!revenue){
      revenue = '0';
  }
  if(revenue.length > 3){
    if(revenue.length > 12){
      revenue = revenue.slice(0, -3) + "." + revenue.slice(-3);
      revenue = revenue.slice(0, -7) + "." + revenue.slice(-7);
      revenue = revenue.slice(0, -11) + "." + revenue.slice(-11);
      revenue = revenue.slice(0, -15) + "." + revenue.slice(-15);
    }else if(revenue.length > 9){
      revenue = revenue.slice(0, -3) + "." + revenue.slice(-3);
      revenue = revenue.slice(0, -7) + "." + revenue.slice(-7);
      revenue = revenue.slice(0, -11) + "." + revenue.slice(-11);
    }else if(revenue.length > 6){
      revenue = revenue.slice(0, -3) + "." + revenue.slice(-3);
      revenue = revenue.slice(0, -7) + "." + revenue.slice(-7);
    }else{
      revenue = revenue.slice(0, -3) + "." + revenue.slice(-3);
    }
  }
return (revenue + '€');
}


//Scoreboard
export const GetClientsTable = (currentZoom, clients, colleagues) => {
  //Get Current Teams
  var teamList = [];
  var currentZoomMembers = [];
  for(let counter = 0; counter < colleagues.length;counter++){
      if(colleagues[counter]['team']){
        if(!teamList.includes(colleagues[counter]['team'])){
          teamList.push(colleagues[counter]['team']);
        }
      }
      if(currentZoom === colleagues[counter]['team']){
        currentZoomMembers.push(colleagues[counter]['name']);
      }
  }

  var zoomLevel;
  if(currentZoom === 'ORG'){
    zoomLevel = 'Company';
  }
  else if(teamList.includes(currentZoom)){
    zoomLevel = 'Team';
  }
  else{
    zoomLevel = 'Individual'
  }

  var peopleList = [];
  var structureList = [];

  //Get current persons per current team 
  for(let counter = 0; counter < teamList.length; counter++){
      for(let sCounter = 0; sCounter < colleagues.length; sCounter++){
      if(colleagues[sCounter]['team'] === teamList[counter]){
          peopleList.push(colleagues[sCounter]['name']);
      }
      }
  structureList.push(peopleList);
  peopleList = [];
  }

  var availableScale = false;
  var clientTable = [];
  let nps_comp, evaluation_comp, renewal_comp, end_comp, start_comp, scale_comp, tempDateCov; 
  for(let counter = 0; counter < clients.length; counter++){
      if(clients[counter]['nps'] !== ''){
        nps_comp = parseInt(clients[counter]['nps']);
      }
      else{
        nps_comp = 0;
      }

      if(clients[counter]['evaluation'] !== '' && clients[counter]['evaluation'].includes('-')){
        tempDateCov = clients[counter]['evaluation'].split('-');
        evaluation_comp = new Date(tempDateCov[1] + '/' + tempDateCov[0] + '/' + tempDateCov[2]);
      }
      else{
        evaluation_comp = clients[counter]['evaluation'];
      }

      if(clients[counter]['renewal'] !== '' && clients[counter]['renewal'].includes('-')){
        tempDateCov = clients[counter]['renewal'].split('-');
        renewal_comp = new Date(tempDateCov[1] + '/' + tempDateCov[0] + '/' + tempDateCov[2]);
      }
      else{
        renewal_comp = clients[counter]['renewal'];
      }

      if(clients[counter]['end'] !== '' && clients[counter]['end'].includes('-')){
        tempDateCov = clients[counter]['end'].split('-');
        end_comp = new Date(tempDateCov[1] + '/' + tempDateCov[0] + '/' + tempDateCov[2]);
      }
      else{
        end_comp = clients[counter]['end'];
      }

      if(clients[counter]['start'] !== '' && clients[counter]['start'].includes('-')){
        tempDateCov = clients[counter]['start'].split('-');
        start_comp = new Date(tempDateCov[1] + '/' + tempDateCov[0] + '/' + tempDateCov[2]);
      }
      else{
        start_comp = clients[counter]['start'];
      }

      if(clients[counter]['scale'] === '🌱'){
        scale_comp = 1;
      }
      else if(clients[counter]['scale'] === '🌿'){
        scale_comp = 2;
      }
      else if(clients[counter]['scale'] === '🪴'){
        scale_comp = 3;
      }
      else if(clients[counter]['scale'] === '🌳'){
        scale_comp = 4;
      }
      else{
        scale_comp = 0;
      }

      if(currentZoom === 'ORG' || currentZoom === clients[counter]['responsible']){
        if(clients[counter]['scale'] === '🌱' || clients[counter]['scale'] === '🌿'  || clients[counter]['scale'] === '🪴' || clients[counter]['scale'] === '🌳'){
          availableScale = true;
        }
          clientTable.push({
              href: '/clients' + makeURL(clients[counter]['name']),
              name: clients[counter]['name'],
              display_name: makeDisplayName(clients[counter]['name']),
              responsible: clients[counter]['responsible'],
              type: clients[counter]['type'],
              language: clients[counter]['language'],
              country: clients[counter]['country'],
              start: clients[counter]['start'],
              start_comp: start_comp,
              end: clients[counter]['end'],
              end_comp: end_comp,
              evaluation: clients[counter]['evaluation'],
              evaluation_comp: evaluation_comp,
              renewal: clients[counter]['renewal'],
              renewal_comp: renewal_comp,
              revenue: formatRevenue(clients[counter]['revenue']),
              revenue_comp: clients[counter]['revenue'],
              scale: clients[counter]['scale'],
              reference: clients[counter]['reference'],
              nps: clients[counter]['nps'],
              nps_comp: nps_comp,
              scale_comp: scale_comp,
          });
      }
      else{
          for(let sCounter = 0; sCounter < teamList.length; sCounter++){
              if(teamList[sCounter] === currentZoom && structureList[sCounter].includes(clients[counter]['responsible'])){
                if(clients[counter]['scale'] === '🌱' || clients[counter]['scale'] === '🌿'  || clients[counter]['scale'] === '🪴' || clients[counter]['scale'] === '🌳'){
                  availableScale = true;
                }
                clientTable.push({
                    href: '/clients' + makeURL(clients[counter]['name']),
                    name: clients[counter]['name'],
                    display_name: makeDisplayName(clients[counter]['name']),
                    responsible: clients[counter]['responsible'],
                    type: clients[counter]['type'],
                    language: clients[counter]['language'],
                    country: clients[counter]['country'],
                    start: clients[counter]['start'],
                    end: clients[counter]['end'],
                    evaluation: clients[counter]['evaluation'],
                    renewal: clients[counter]['renewal'],
                    revenue: formatRevenue(clients[counter]['revenue']),
                    scale: clients[counter]['scale'],
                    reference: clients[counter]['reference'],
                    nps: clients[counter]['nps'],
                    start_comp: start_comp,
                    end_comp: end_comp,
                    renewal_comp: renewal_comp,
                    evaluation_comp: evaluation_comp,
                    revenue_comp: clients[counter]['revenue'],
                    nps_comp: nps_comp,
                    scale_comp: scale_comp,
                });
              }
          }
      }
  }
  if(availableScale){
    var [multipleServicesPieChart, multipleServicesBarChart, multipleServicesBarChartAll] = GetMultibleServicesCharts(clientTable, structureList, teamList, clients, zoomLevel, currentZoomMembers, colleagues);
    return [clientTable, multipleServicesPieChart, multipleServicesBarChart, multipleServicesBarChartAll];
  }
  else{
    return [clientTable, '', '', ''];
  }
}

function GetMultibleServicesCharts(clientList, structureList, teamList, clients, zoomLevel, currentZoomMembers, colleagues){
//Calculate Service
let stageZero = 0;
let stageOne = 0;
let stageTwo = 0; 
let stageThree = 0;
let stageFour = 0;

for(let counter = 0; counter < clientList.length; counter++){
  if(clientList[counter]['scale'] === "🌱"){
    stageOne++;
  }
  else if(clientList[counter]['scale'] === "🌿"){
    stageTwo++;
  }
  else if(clientList[counter]['scale'] === "🪴"){
    stageThree++;
  }
  else if(clientList[counter]['scale'] === "🌳"){
    stageFour++;
  }
  else{
    stageZero++;
  }
}


//Convert numbers to %
let numberOfScales = clientList.length - stageZero;
let stageOneProsentage = (stageOne / numberOfScales * 100).toFixed(1);
let stageTwoProsentage = (stageTwo / numberOfScales * 100).toFixed(1);
let stageThreeProsentage = (stageThree / numberOfScales * 100).toFixed(1);
let stageFourProsentage = (stageFour/ numberOfScales * 100).toFixed(1);

let labelFontSize = 14;
let pieLabelFontSize = 16;
let chartTextAngle = 55;
if(window.innerWidth <= 640){
  labelFontSize = 12;
  pieLabelFontSize = 14;
  chartTextAngle = 65;
}

var colorPalette = ['#C8692B', '#FFF2CC', '#93C47D', '#38761D']
var MSpie = {
  tooltip: {
    trigger: 'item',
    valueFormatter: (value) => value + ' Clients',
  },
  series: [
    {
      color: colorPalette,
      type: 'pie',
      radius: '80%',
      label:{
        normal:{
          textStyle:{
           fontSize: pieLabelFontSize,
          },  
        }
      },
      data: [
        { value: stageOne, name: '🌱 ' +  stageOneProsentage + '%' },
        { value: stageTwo, name: '🌿 ' + stageTwoProsentage + '%' },
        { value: stageThree, name: '🪴 ' + stageThreeProsentage + '%' },
        { value: stageFour, name: '🌳 ' + stageFourProsentage + '%'}
      ],
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }
  ]
};

//Setup: all individuals for company zoom
var jsonAllIndividuals = [];
var allIndividualsListValues = [];
var allIndividualsListNames = [];
for(let counter = 0; counter < colleagues.length; counter++){
  jsonAllIndividuals.push({name: colleagues[counter]['name'], total: 0, multiple_services: 0, percent: 0})
}

//Setup: teams & team members
var teamListAmount = [];
var totalTeamListAmount = [];
var chartValueList = [];
var jsonChartList = [];
var MSbar;


if(zoomLevel === 'Company'){
  //Setup Lists
  for (let counter = 0; counter < teamList.length; counter++){
    teamListAmount.push(0);
    totalTeamListAmount.push(0);
  }

  //Get Numbers for lists
  for(let sCounter = 0; sCounter < clients.length; sCounter++){
    for(let counter = 0; counter < jsonAllIndividuals.length; counter++){
      if(jsonAllIndividuals[counter]['name'] === clients[sCounter]['responsible'] && parseFloat(clients[sCounter]['revenue']) > 3500){
        jsonAllIndividuals[counter]['total']++;
        jsonAllIndividuals[counter]['multiple_services']++;
      }
      else if(jsonAllIndividuals[counter]['name'] === clients[sCounter]['responsible']){
        jsonAllIndividuals[counter]['total']++;
      }
    }
    for(let counter = 0; counter < teamList.length; counter++){
      if(structureList[counter].includes(clients[sCounter]['responsible']) && parseFloat(clients[sCounter]['revenue']) > 3500){
        teamListAmount[counter]++;
        totalTeamListAmount[counter]++;
      }
      else if(structureList[counter].includes(clients[sCounter]['responsible'])){
        totalTeamListAmount[counter]++;
      }
    }
  }

  for(let counter = 0; counter < teamListAmount.length; counter++){
    if(teamListAmount[counter] !== 0 && totalTeamListAmount[counter] !== 0){
      chartValueList.push(Math.round(teamListAmount[counter] / totalTeamListAmount[counter] * 100));
    }
    else{
      chartValueList.push(0);
    }
  }

  //Create json of 2 lists, sort and revert to lists
  for(let counter = 0; counter < chartValueList.length; counter++){
    jsonChartList.push({'name': teamList[counter], 'value': chartValueList[counter]});
  }
  jsonChartList.sort((a,b) =>  a.value-b.value );
  for(var counter = 0; counter < jsonChartList.length; counter++){
    chartValueList[counter] = jsonChartList[counter]['value'];
    teamList[counter] = jsonChartList[counter]['name'];
  }

  //Filter and sort jsonAllIndividuals & create 2 arrays from it
  for(let counter = 0; counter < jsonAllIndividuals.length; counter++){
    if(jsonAllIndividuals[counter]['total'] !== 0){
      jsonAllIndividuals[counter]['percent'] = Math.round(jsonAllIndividuals[counter]['multiple_services'] / jsonAllIndividuals[counter]['total'] * 100)
    }
    else{
      jsonAllIndividuals[counter]['percent'] = '';
    }
  }

  jsonAllIndividuals = jsonAllIndividuals.filter(function(value, index, arr){ 
    return value.percent !== '';
  });
  jsonAllIndividuals.sort((a,b) =>  a.percent-b.percent );
  jsonAllIndividuals.reverse();
  for(let counter = 0; counter < jsonAllIndividuals.length; counter++){
    allIndividualsListNames.push(jsonAllIndividuals[counter]['name']);
    allIndividualsListValues.push(jsonAllIndividuals[counter]['percent']);
  }

  MSbar = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      valueFormatter: (value) => value + '%',
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '5%',
      containLabel: true
    },
    xAxis: {
      type: 'value',
      boundaryGap: [0, 0.01],
      axisLabel: {formatter: (value) => value + '%', fontSize: labelFontSize,},
    },
    yAxis: {
      type: 'category',
      data: teamList,
      axisTick: { show: false },
      axisLabel: {fontSize: labelFontSize},
    },
    series: [
      {
        name: 'Multiple Services',
        type: 'bar',
        data: chartValueList,
        color: '#C8692B',
        label:{
          normal:{
            textStyle:{
             fontSize: 16,
            },  
          }
        },
      }
    ]
  };

  var MSbarAll = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      valueFormatter: (value) => value + '%',
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '5%',
      containLabel: true
    },
    xAxis: [
      {
        type: 'category',
        data: allIndividualsListNames,
        axisLabel: {fontSize: labelFontSize,  interval: 0, rotate: chartTextAngle,},
        axisTick: { show: false },
      }
    ],
    yAxis: [
      {
        type: 'value',
        axisLabel: {formatter: (value) => value + '%', fontSize: labelFontSize},
      }
    ],
    series: [
      {
        name: 'Multiple Services',
        type: 'bar',
        barWidth: '60%',
        data: allIndividualsListValues,
        color: '#C8692B',
      }
    ]
  };
  return [MSpie, MSbar, MSbarAll];
}
else if(zoomLevel === 'Team'){
  //Setup Lists
  for (let counter = 0; counter < currentZoomMembers.length; counter++){
    teamListAmount.push(0);
    totalTeamListAmount.push(0);
  }

  for(let counter = 0; counter < clients.length; counter++){
    if(currentZoomMembers.includes(clients[counter]['responsible']) && parseFloat(clients[counter]['revenue']) > 3500){
      for(let sCounter = 0; sCounter < currentZoomMembers.length; sCounter++){
        if(currentZoomMembers[sCounter] === clients[counter]['responsible']){
          teamListAmount[sCounter]++;
          totalTeamListAmount[sCounter]++;
        }
      }
    }
    else if(currentZoomMembers.includes(clients[counter]['responsible'])){
      for(let sCounter = 0; sCounter < currentZoomMembers.length; sCounter++){
        if(currentZoomMembers[sCounter] === clients[counter]['responsible']){
          totalTeamListAmount[sCounter]++;
        }
      }
    }
  }


  for(let counter = 0; counter < teamListAmount.length; counter++){
    if(teamListAmount[counter] !== 0 && totalTeamListAmount[counter] !== 0){
      chartValueList.push(Math.round(teamListAmount[counter] / totalTeamListAmount[counter] * 100));
    }
    else{
      chartValueList.push(0);
    }
  }


  //Create json of 2 lists, sort and revert to lists
  for(let counter = 0; counter < chartValueList.length; counter++){
    jsonChartList.push({'name': currentZoomMembers[counter], 'value': chartValueList[counter]});
  }
  jsonChartList.sort((a,b) =>  a.value-b.value );
  jsonChartList.reverse();
  for(let counter = 0; counter < jsonChartList.length; counter++){
    chartValueList[counter] = jsonChartList[counter]['value'];
    currentZoomMembers[counter] = jsonChartList[counter]['name'];
  }

  MSbar = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      valueFormatter: (value) => value + '%',
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '5%',
      containLabel: true
    },
    xAxis: [
      {
        type: 'category',
        data: currentZoomMembers,
        axisLabel: {fontSize: labelFontSize},
        axisTick: { show: false },
      }
    ],
    yAxis: [
      {
        type: 'value',
        axisLabel: {formatter: (value) => value + '%', fontSize: labelFontSize},
      }
    ],
    series: [
      {
        name: 'Multiple Services',
        type: 'bar',
        barWidth: '60%',
        data: chartValueList,
        color: '#C8692B',
      }
    ]
  };
  return [MSpie, MSbar, ''];
}
else{
  return [MSpie, '', ''];
}
}


function makeURL(raw_data){
return '/' + raw_data.toLowerCase().replaceAll(' - ',' ').normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z ]/g, "").replaceAll(' ','-').replaceAll('--','-');
}

function makeDisplayName(name){
if(name.length > 29){
  name = name.slice(0,27);
  if(name.slice(-1) === ' '){
    return name.slice(0,26) + '...';
  }
  else{
    return name + '...';
  }
}
else{
  return name;
}
}


export const GetLostClientCharts = (lostClients, currentZoom, colleagues, allColleagues) => {
  const today = new Date();
  const currentYear = today.getFullYear();
  var currentTeamZoomMembers = [];
  var jsonCurrentTeamZoomMembers = allColleagues.filter(function(value, index, arr){ 
    return value.team === currentZoom;
  });
  for(let counter = 0; counter < jsonCurrentTeamZoomMembers.length; counter++){
    currentTeamZoomMembers.push(jsonCurrentTeamZoomMembers[counter]['name'])
  }
  let teamList = [];
  let completeList = [];
  let perPersonLostList = {};
  for(let counter = 0; counter < colleagues.length;counter++){
    if(colleagues[counter]['team']){
      if(!teamList.includes(colleagues[counter]['team'])){
        teamList.push(colleagues[counter]['team']);
      }
    }
  }
  let tempList = [];
  for(let counter = 0; counter < teamList.length;counter++){
    for(let sCounter = 0; sCounter < allColleagues.length; sCounter++){
      if(allColleagues[sCounter]['team'] === teamList[counter]){
        tempList.push(allColleagues[sCounter]['name']);
      }
    }
    completeList.push([0, teamList[counter] ,tempList]);
    tempList = [];
  }

  //perPerson List Creation
  if(currentZoom === 'ORG'){
    for(let counter = 0; counter < allColleagues.length; counter++){
      perPersonLostList[allColleagues[counter]['name']] = 0;
    }
  }
  else if(currentTeamZoomMembers.length !== 0){
    for(let counter = 0; counter < currentTeamZoomMembers.length; counter++){
      perPersonLostList[currentTeamZoomMembers[counter]] = 0;
    }
  }

  var jsonLostClientsPerYearList = [];
  var lostClientsPerYearListYear = [];
  var lostClientsPerYearListLost = [];
  var tempDate, tempYear;

  //Update end info to dates  
  for(let counter = 0; counter < lostClients.length; counter++){
    if(lostClients[counter]['end'] && (currentZoom === 'ORG' || currentZoom === lostClients[counter]['contact'] || currentTeamZoomMembers.includes(lostClients[counter]['contact']))){
      tempDate = lostClients[counter]['end'].split('-');
      tempDate = new Date(tempDate[1] + '/' + tempDate[0] + '/20' + tempDate[2]);
      tempYear = tempDate.getFullYear();
      jsonLostClientsPerYearList.push({date: tempDate, year: tempYear});
    }
    if(parseInt('20' + lostClients[counter]['end'].split('-')[2]) === currentYear && (currentZoom === 'ORG' || currentTeamZoomMembers.includes(lostClients[counter]['contact']))){
      perPersonLostList[lostClients[counter]['contact']] += 1;
    }
  }

  if(!jsonLostClientsPerYearList || jsonLostClientsPerYearList.length === 0){
    return ['', '', ''];
  }
  else{
    //Sort & Filter data
    jsonLostClientsPerYearList.sort((date1, date2) => date1.year - date2.year);
    for(let counter = 0; counter < (jsonLostClientsPerYearList[jsonLostClientsPerYearList.length - 1]['year'] - jsonLostClientsPerYearList[0]['year'] + 1); counter++){
      lostClientsPerYearListYear.push(jsonLostClientsPerYearList[0]['year'] + counter);
      lostClientsPerYearListLost.push(0);
      lostClientsPerYearListLost[counter] = jsonLostClientsPerYearList.filter(function(value, index, arr){ 
        return value.year === jsonLostClientsPerYearList[0]['year'] + counter;
      });
      lostClientsPerYearListLost[counter] = lostClientsPerYearListLost[counter].length
    }
  }

  //Chart
  let labelFontSize = 14;
  let chartTextAngle = 55;
  if(window.innerWidth <= 640){
    labelFontSize = 12;
    chartTextAngle = 65;
  }

  let lostClientsByYearData = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      valueFormatter: (value) => value,
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '5%',
      containLabel: true
    },
    xAxis: [
      {
        type: 'category',
        data: lostClientsPerYearListYear,
        axisLabel: {fontSize: labelFontSize},
        axisTick: { show: false },
      }
    ],
    yAxis: [
      {
        type: 'value',
        axisLabel: {formatter: (value) => value, fontSize: labelFontSize},
      }
    ],
    series: [
      {
        name: 'Lost clients',
        type: 'bar',
        barWidth: '60%',
        data: lostClientsPerYearListLost,
        color: '#C8692B',
      }
    ]
  };



    //Filter colleagues without lost clients
    let lostPerPersonData = [];
    let lostPerPersonTitles = [];
    let lostPerPersonValues = [];
    let lostClientsPerPersonChart;
    //Filter out 0 entries and convert to array
    for (var key in perPersonLostList) {
      if (perPersonLostList.hasOwnProperty(key) && perPersonLostList[key] !== 0 && key) {
        lostPerPersonData.push([perPersonLostList[key], key]);
      }
    }
    if(lostPerPersonData.length !== 0){
      //Sort
      lostPerPersonData.sort(function(a, b){return a[0] - b[0]}).reverse();
      //Create Chart Arrays
      for(let counter = 0; counter < lostPerPersonData.length; counter++){
        lostPerPersonValues.push(lostPerPersonData[counter][0]);
        lostPerPersonTitles.push(lostPerPersonData[counter][1]);
      }
      let AngleForPerPerson;
      if(currentZoom === 'ORG'){
        AngleForPerPerson = chartTextAngle;
      }
      else{
        AngleForPerPerson = 0;
      }

      lostClientsPerPersonChart = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          },
          valueFormatter: (value) => value,
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          top: '5%',
          containLabel: true
        },
        xAxis: [
          {
            type: 'category',
            data: lostPerPersonTitles,
            axisLabel: {fontSize: labelFontSize,  interval: 0, rotate: AngleForPerPerson,},            
            axisTick: { show: false },
          }
        ],
        yAxis: [
          {
            type: 'value',
            axisLabel: {formatter: (value) => value, fontSize: labelFontSize},
          }
        ],
        series: [
          {
            name: 'Lost clients',
            type: 'bar',
            barWidth: '60%',
            data: lostPerPersonValues,
            color: '#C8692B',
          }
        ]
      };
    }

  //Lost clients per team chart if on company zoom
  if(currentZoom !== 'ORG'){
    return [lostClientsByYearData, lostClientsPerPersonChart, ''];
  }
  else{
    const currentYear = new Date().getFullYear();
    for(let counter = 0; counter < lostClients.length; counter++){
      if(lostClients[counter]['end']){
        tempDate = lostClients[counter]['end'].split('-');
        tempDate = parseInt('20' + tempDate[2]);
        for(let sCounter = 0; sCounter < completeList.length; sCounter++){
          if(currentYear === tempDate && completeList[sCounter][2].includes(lostClients[counter]['contact'])){
            completeList[sCounter][0]++;
          }
        }
      }
    }

    //Sort and get arrays for echart
    completeList.sort(function(a, b){return a[0] - b[0]})
    let teamChartList = [];
    let dataChartList = [];
    for(let counter = 0; counter < completeList.length; counter++){
      teamChartList.push(completeList[counter][1]);
      dataChartList.push(completeList[counter][0]);
    }

    let lostClientsPerTeamChart = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        },
        valueFormatter: (value) => value + '',
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: '5%',
        containLabel: true
      },
      xAxis: {
        type: 'value',
        boundaryGap: [0, 0.01],
        axisLabel: {formatter: (value) => value + '', fontSize: labelFontSize,},
      },
      yAxis: {
        type: 'category',
        data: teamChartList,
        axisTick: { show: false },
        axisLabel: {fontSize: labelFontSize},
      },
      series: [
        {
          name: 'Lost clients',
          type: 'bar',
          data: dataChartList,
          color: '#C8692B',
          label:{
            normal:{
              textStyle:{
              fontSize: 16,
              },  
            }
          },
        }
      ]
    };
    return [lostClientsByYearData, lostClientsPerPersonChart, lostClientsPerTeamChart];
  }
}

//------------------------------------------------------------------------------------------------------------------------------

export const GetCCcharts = (currentZoom, clients, colleagues) => {
//Chart Settings:
let clientsPerChart, ClinetsWithNPSChart, NPSScoresChart, clientsPerAll, clientsNPSPerAll, npsAmountChartAll, npsPieChart;
let colleagueClientsList = [];
let colleagueClientsNPSList = [];
let labelFontSize = 14;
let pieLabelFontSize = 16;
if(window.innerWidth <= 640){
  labelFontSize = 12;
  pieLabelFontSize = 14;
}
//Get teams and team members
let teamList = [];
let completeList = [];
for(let counter = 0; counter < colleagues.length;counter++){
  colleagueClientsList.push([colleagues[counter]['name'], 0]);
  //NPS All: name, total, nps, entries, clients, NPS prosentage
  colleagueClientsNPSList.push([colleagues[counter]['name'], 0, 0, 0, 0]);
  if(colleagues[counter]['team']){
    if(!teamList.includes(colleagues[counter]['team'])){
      teamList.push(colleagues[counter]['team']);
    }
  }
}
let tempList = [];
for(let counter = 0; counter < teamList.length;counter++){
  for(let sCounter = 0; sCounter < colleagues.length; sCounter++){
    if(colleagues[sCounter]['team'] === teamList[counter]){
      tempList.push(colleagues[sCounter]['name']);
    }
  }
  //NumberofClients, NPS, sumNPS, NumberofNPS, teamName, teamMembers, %ofclientsNPS
  completeList.push([0, 0, 0, 0, teamList[counter], tempList, 0]);
  tempList = [];
}

//Variables present in every zoom
let clientsNameList = [];
let clientsValueList = [];
let clientsNameListAll = [];
let clientsValueListAll = [];
let clientsNPSNameListAll = [];
let clientsNPSValueListAll = [];
let numberOfNPSNameList = [];
let numberOfNPSValueList = [];
let npsProsentageNameList = [];
let npsProsentageValueList = [];
let npsNameList = [];
let npsValueList = [];


if(currentZoom === 'ORG'){
  //Get NPS sum & total of entires per team
  for(let counter = 0; counter < clients.length; counter++){
    //Clients All: Get Data
    for(let sCounter = 0; sCounter < colleagueClientsList.length; sCounter++){
      if(colleagueClientsList[sCounter][0] === clients[counter]['responsible']){
        colleagueClientsList[sCounter][1]++;
      }
      //NPS All: Get Data
      if(colleagueClientsNPSList[sCounter][0] === clients[counter]['responsible'] && typeof(parseInt(clients[counter]['nps'])) === 'number' && !isNaN(parseInt(clients[counter]['nps']))){
        colleagueClientsNPSList[sCounter][2] += parseInt(clients[counter]['nps']);
        colleagueClientsNPSList[sCounter][3]++;
      }
      //Clients with NPS All: Get Data 
      if(colleagueClientsNPSList[sCounter][0] === clients[counter]['responsible']){
        colleagueClientsNPSList[sCounter][4]++;
      }
    }
    for(let sCounter = 0; sCounter < completeList.length; sCounter++){
      if(completeList[sCounter][5].includes(clients[counter]['responsible'])){
        completeList[sCounter][0] += 1;
      }
      if(completeList[sCounter][5].includes(clients[counter]['responsible']) && typeof(parseInt(clients[counter]['nps'])) === 'number' && !isNaN(parseInt(clients[counter]['nps']))){
        completeList[sCounter][2] += parseInt(clients[counter]['nps']);
        completeList[sCounter][3] += 1;
      }
    }
  }

  //Clients All: Filter
  colleagueClientsList.sort(function(a, b){return a[1] - b[1]}).reverse();
  for(let counter = 0; counter < colleagueClientsList.length; counter++){
    if(colleagueClientsList[counter][1] !== 0){
      clientsNameListAll.push(colleagueClientsList[counter][0]);
      clientsValueListAll.push(colleagueClientsList[counter][1]);
    }
  }

    //NPS All: name, total, nps, entries, clients, NPSprosentage
  //NPS All: Calc & Filter
  for(let counter = 0; counter < colleagueClientsNPSList.length; counter++){
    if(colleagueClientsNPSList[counter][2] !== 0){
      colleagueClientsNPSList[counter][1] = (colleagueClientsNPSList[counter][2] / colleagueClientsNPSList[counter][3]).toFixed(1);
    }
    //Clients with NPS All: Calc
    if(colleagueClientsNPSList[counter][4] !== 0){
      colleagueClientsNPSList[counter][5] = Math.round(colleagueClientsNPSList[counter][3] / colleagueClientsNPSList[counter][4] * 100)
    }
  }
  colleagueClientsNPSList.sort(function(a, b){return a[1] - b[1]}).reverse();
  for(let counter = 0; counter < colleagueClientsNPSList.length; counter++){
    if(colleagueClientsNPSList[counter][3] !== 0){
      clientsNPSNameListAll.push(colleagueClientsNPSList[counter][0]);
      clientsNPSValueListAll.push(colleagueClientsNPSList[counter][1]);
    }
  }

  //Clients with NPS All: Filter
  colleagueClientsNPSList.sort(function(a, b){return a[5] - b[5]}).reverse();
  for(let counter = 0; counter < colleagueClientsNPSList.length; counter++){
    if(colleagueClientsNPSList[counter][4] !== 0){
      npsProsentageNameList.push(colleagueClientsNPSList[counter][0]);
      npsProsentageValueList.push(colleagueClientsNPSList[counter][5]);
    }
  }

  //Calculate Average & % of clients with nps:
  for(let counter = 0; counter < completeList.length; counter++){
    completeList[counter][1] = (completeList[counter][2] / completeList[counter][3]).toFixed(1);
    completeList[counter][6] = Math.round(completeList[counter][3] / completeList[counter][0] * 100);
    if(isNaN(completeList[counter][1])){
      completeList[counter][1] = 0;
    }
    if(isNaN(completeList[counter][6])){
      completeList[counter][6] = 0;
    }
  }

  //Sort for NPS:
  completeList.sort(function(a, b){return a[1] - b[1]});

  //Make NPS Chart Arrays
  for(let counter = 0; counter < completeList.length; counter++){
    npsNameList.push(completeList[counter][4]);
    npsValueList.push(completeList[counter][1]);
  }

  //Sort for Clients:
  completeList.sort(function(a, b){return a[0] - b[0]});

  //Make Clients Chart Arrays
  for(let counter = 0; counter < completeList.length; counter++){
    clientsNameList.push(completeList[counter][4]);
    clientsValueList.push(completeList[counter][0]);
  }
  
  //Sort for % clients with nps
  completeList.sort(function(a, b){return a[6] - b[6]});
  
  //Make Clients Chart Arrays
  for(let counter = 0; counter < completeList.length; counter++){
    numberOfNPSNameList.push(completeList[counter][4]);
    numberOfNPSValueList.push(completeList[counter][6]);
  }
  
  //Chart
  NPSScoresChart = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      valueFormatter: (value) => value + '',
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '5%',
      containLabel: true
    },
    xAxis: {
      type: 'value',
      boundaryGap: [0, 0.01],
      axisLabel: {formatter: (value) => value + '', fontSize: labelFontSize,},
    },
    yAxis: {
      type: 'category',
      data: npsNameList,
      axisTick: { show: false },
      axisLabel: {fontSize: labelFontSize},
    },
    series: [
      {
        name: 'NPS',
        type: 'bar',
        data: npsValueList,
        color: '#C8692B',
        label:{
          normal:{
            textStyle:{
            fontSize: 16,
            },  
          }
        },
      }
    ]
  };

  clientsPerChart = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      valueFormatter: (value) => value + '',
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '5%',
      containLabel: true
    },
    xAxis: {
      type: 'value',
      boundaryGap: [0, 0.01],
      axisLabel: {formatter: (value) => value + '', fontSize: labelFontSize,},
    },
    yAxis: {
      type: 'category',
      data: clientsNameList,
      axisTick: { show: false },
      axisLabel: {fontSize: labelFontSize},
    },
    series: [
      {
        name: 'Clients',
        type: 'bar',
        data: clientsValueList,
        color: '#C8692B',
        label:{
          normal:{
            textStyle:{
            fontSize: 16,
            },  
          }
        },
      }
    ]
  };
  ClinetsWithNPSChart = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      valueFormatter: (value) => value + '%',
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '5%',
      containLabel: true
    },
    xAxis: {
      type: 'value',
      boundaryGap: [0, 0.01],
      axisLabel: {formatter: (value) => value + '%', fontSize: labelFontSize,},
    },
    yAxis: {
      type: 'category',
      data: numberOfNPSNameList,
      axisTick: { show: false },
      axisLabel: {fontSize: labelFontSize},
    },
    series: [
      {
        name: 'Clients with NPS',
        type: 'bar',
        data: numberOfNPSValueList,
        color: '#C8692B',
        label:{
          normal:{
            textStyle:{
            fontSize: 16,
            },  
          }
        },
      }
    ]
  };

  //Clients All: Chart
  clientsPerAll = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      valueFormatter: (value) => value + '',
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '5%',
      containLabel: true
    },
    xAxis: [
      {
        type: 'category',
        data: clientsNameListAll,
        axisLabel: {fontSize: labelFontSize, interval: 0, rotate: 90,},
        axisTick: { show: false },
      }
    ],
    yAxis: [
      {
        type: 'value',
        axisLabel: {formatter: (value) => value + '', fontSize: labelFontSize},
      }
    ],
    series: [
      {
        name: 'Clients',
        type: 'bar',
        barWidth: '60%',
        data: clientsValueListAll,
        color: '#C8692B',
      }
    ]
  };

    //NPS All: Chart
    clientsNPSPerAll = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        },
        valueFormatter: (value) => value + '',
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: '5%',
        containLabel: true
      },
      xAxis: [
        {
          type: 'category',
          data: clientsNPSNameListAll,
          axisLabel: {fontSize: labelFontSize, interval: 0, rotate: 90,},
          axisTick: { show: false },
        }
      ],
      yAxis: [
        {
          type: 'value',
          axisLabel: {formatter: (value) => value + '', fontSize: labelFontSize},
        }
      ],
      series: [
        {
          name: 'NPS',
          type: 'bar',
          barWidth: '60%',
          data: clientsNPSValueListAll,
          color: '#C8692B',
        }
      ]
    };

    //Clients with NPS All: Chart
    npsAmountChartAll = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        },
        valueFormatter: (value) => value + '%',
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: '5%',
        containLabel: true
      },
      xAxis: [
        {
          type: 'category',
          data: npsProsentageNameList,
          axisLabel: {fontSize: labelFontSize, interval: 0, rotate: 90,},
          axisTick: { show: false },
        }
      ],
      yAxis: [
        {
          type: 'value',
          axisLabel: {formatter: (value) => value + '%', fontSize: labelFontSize},
        }
      ],
      series: [
        {
          name: 'Clients with NPS',
          type: 'bar',
          barWidth: '60%',
          data: npsProsentageValueList,
          color: '#C8692B',
        }
      ]
    };

  return [NPSScoresChart, clientsPerChart, ClinetsWithNPSChart, clientsPerAll, clientsNPSPerAll, npsAmountChartAll, npsPieChart];
}
else if(teamList.includes(currentZoom)){
  let currentZoomClients = [];
  let checkTotal = 0;
  for(let counter = 0; counter < completeList.length; counter++){
    if(currentZoom === completeList[counter][4]){
      for(let sCounter = 0; sCounter < completeList[counter][5].length; sCounter++){
        //NumberOfClients, Member, NumberOfNPS, %ClientsWithNPS, NPSTotal, NPSAverage
        currentZoomClients.push([0, completeList[counter][5][sCounter], 0, 0, 0, 0]);
      }
    }
  }
  for(let counter = 0; counter < clients.length; counter++){
    for(let sCounter = 0; sCounter < currentZoomClients.length; sCounter++){
      if(currentZoomClients[sCounter][1] === clients[counter]['responsible']){
        currentZoomClients[sCounter][0]++;
        if(typeof(parseInt(clients[counter]['nps'])) === 'number' && !isNaN(parseInt(clients[counter]['nps']))){
          currentZoomClients[sCounter][2]++;
          currentZoomClients[sCounter][4] += parseInt(clients[counter]['nps']);
        }
      }
    }
  }

  //Sort for Clients:
  currentZoomClients.sort(function(a, b){return a[0] - b[0]}).reverse();
  let tempNumber = 0;
  //Make Clients Chart Arrays
  for(let counter = 0; counter < currentZoomClients.length; counter++){
    clientsNameList.push(currentZoomClients[counter][1]);
    clientsValueList.push(currentZoomClients[counter][0]);
    checkTotal += currentZoomClients[counter][0];
    //Calculate number of clients with nps % 
    tempNumber = Math.round(currentZoomClients[counter][2] / currentZoomClients[counter][0] * 100);
    if(isNaN(tempNumber)){
      tempNumber = 0;
    }
    currentZoomClients[counter][3] = tempNumber
    //Calculate Average NPS
    tempNumber = (currentZoomClients[counter][4] / currentZoomClients[counter][2]).toFixed(1);
    if(isNaN(tempNumber)){
      tempNumber = 0;
    }
    currentZoomClients[counter][5] = tempNumber
  }

  //Sort for clients with nps %
  currentZoomClients.sort(function(a, b){return a[3] - b[3]}).reverse();
  //Make Clients Chart Arrays
  for(let counter = 0; counter < currentZoomClients.length; counter++){
    numberOfNPSNameList.push(currentZoomClients[counter][1]);
    numberOfNPSValueList.push(currentZoomClients[counter][3]);
  }

  //Sort for average nps
  currentZoomClients.sort(function(a, b){return a[5] - b[5]}).reverse();
  //Make NPS Average Chart Arrays
  for(let counter = 0; counter < currentZoomClients.length; counter++){
    npsNameList.push(currentZoomClients[counter][1]);
    npsValueList.push(currentZoomClients[counter][5]);
  }

  if(checkTotal === 0){
    clientsPerChart = '';
    ClinetsWithNPSChart = '';
    NPSScoresChart = '';
  }
  else{
    clientsPerChart = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        },
        valueFormatter: (value) => value + '',
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: '5%',
        containLabel: true
      },
      xAxis: [
        {
          type: 'category',
          data: clientsNameList,
          axisLabel: {fontSize: labelFontSize},
          axisTick: { show: false },
        }
      ],
      yAxis: [
        {
          type: 'value',
          axisLabel: {formatter: (value) => value + '', fontSize: labelFontSize},
        }
      ],
      series: [
        {
          name: 'Clients',
          type: 'bar',
          barWidth: '60%',
          data: clientsValueList,
          color: '#C8692B',
        }
      ]
    };

    ClinetsWithNPSChart = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        },
        valueFormatter: (value) => value + '%',
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: '5%',
        containLabel: true
      },
      xAxis: [
        {
          type: 'category',
          data: numberOfNPSNameList,
          axisLabel: {fontSize: labelFontSize},
          axisTick: { show: false },
        }
      ],
      yAxis: [
        {
          type: 'value',
          axisLabel: {formatter: (value) => value + '%', fontSize: labelFontSize},
        }
      ],
      series: [
        {
          name: 'Clients with NPS',
          type: 'bar',
          barWidth: '60%',
          data: numberOfNPSValueList,
          color: '#C8692B',
        }
      ]
    };

    NPSScoresChart = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        },
        valueFormatter: (value) => value + '',
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: '5%',
        containLabel: true
      },
      xAxis: [
        {
          type: 'category',
          data: npsNameList,
          axisLabel: {fontSize: labelFontSize},
          axisTick: { show: false },
        }
      ],
      yAxis: [
        {
          type: 'value',
          axisLabel: {formatter: (value) => value + '', fontSize: labelFontSize},
        }
      ],
      series: [
        {
          name: 'NPS',
          type: 'bar',
          barWidth: '60%',
          data: npsValueList,
          color: '#C8692B',
        }
      ]
    };
  }
  return [NPSScoresChart, clientsPerChart, ClinetsWithNPSChart, '', '', '', npsPieChart];
}
else{
  //NPS Pie: Get Data
  let npsPieChartData = [];
  let npsScores = [['0', 0], ['1', 0], ['2', 0], ['3', 0], ['4', 0], ['5', 0], ['6', 0], ['7', 0], ['8', 0], ['9', 0], ['10', 0], ['No NPS', 0]];
  for(let counter = 0; counter < clients.length; counter++){
    if(currentZoom === clients[counter]['responsible'] && typeof(parseInt(clients[counter]['nps'])) === 'number' && !isNaN(parseInt(clients[counter]['nps']))){
      npsScores[parseInt(clients[counter]['nps'])][1]++;
    }
    else if(currentZoom === clients[counter]['responsible']){
      npsScores[11][1]++;
    }
  } 
  
  let colorPalette = ['#ffdd00', '#ffd000', '#ffc300', '#ffb700', '#ffaa00', '#ffa200', '#ff9500', '#ff8800', '#ff7b00', '#f27100', '#d96500', '#ffea00'];
  // let colorPalette = ['#800e13', '#640d14', '#ffdd00', '#ffb700', '#ffaa00', '#D38755', '#CD7840', '#C8692B','#93C47D', '#6aa84f', '#38761D', '#ad2831'];
  let usedcolorPalette = [];
  for(let counter = 0; counter < npsScores.length; counter++){
    if(npsScores[counter][1] !== 0){
      npsPieChartData.push({value: npsScores[counter][1], name: npsScores[counter][0]});
      usedcolorPalette.push(colorPalette[counter]);
    }
  }

  if(npsPieChartData.length !== 0){
    //NPS Pie: Chart
    npsPieChart = {
      tooltip: {
        trigger: 'item',
        valueFormatter: (value) => value + ' Clients',
      },
      series: [
        {
          color: usedcolorPalette,
          type: 'pie',
          radius: '80%',
          label:{
            normal:{
              textStyle:{
                fontSize: pieLabelFontSize,
              },  
            }
          },
          data: npsPieChartData,
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }
      ]
    };
  }
  
  return ['', '', '', '', '', '', npsPieChart];
}
}


export const FilterCharts = (selection, currentZoom, chartList) => {
  let titleList = [];
  let returnTitleList = [];
  let returnChartList = [];
  //Clients
  if(currentZoom === 'ORG' && selection === 0){
    titleList = [
      'Clients per team',
      'Clients per person'
    ];
  }
  else if(selection === 0){
    titleList = [
      'Clients per team member',
      'Clients per person'
    ];
  }
  //Multiple Services
  if(currentZoom === 'ORG' && selection === 1){
    titleList = [
      'Multiple services per team',
      'Multiple services per person'
    ];
  }
  else if(selection === 1){
    titleList = [
      'Multiple services per team member',
      'Multiple services per person'
    ];
  }
  //NPS
  if(currentZoom === 'ORG' && selection === 2){
    titleList = [
      'NPS per team',
      'NPS per person'
    ];
  }
  else if(selection === 2){
    titleList = [
      'NPS per team member',
      'NPS per person'
    ];
  }
  //Lost Clients
  if(currentZoom === 'ORG' && selection === 3){
    titleList = [
      'Lost clients per team',
      'Lost clients per person'
    ];
  }
  else if(selection === 3){
    titleList = [
      'Lost clients per team member',
      'Lost clients per team member'
    ];
  }
  //Clients with NPS
  if(currentZoom === 'ORG' && selection === 4){
    titleList = [
      'Clients with NPS per team',
      'Clients with NPS per person'
    ];
  }
  else if(selection === 4){
    titleList = [
      'Clients with NPS per team member',
      'Clients with NPS per person'
    ];
  }
  
  for (let counter = 0; counter < chartList.length; counter++){
    if(chartList[counter]){
      returnTitleList.push(titleList[counter]);
      returnChartList.push(chartList[counter]);
    }
  }

  return [returnTitleList, returnChartList];
}
