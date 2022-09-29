export const GetLateInvoices = (invoices, colleagues, zoom) => {
  var lateInvoices = [];
  lateInvoices = [];
  var dateFormat,deadLine, initialDate, team, goneDays;
  var today = new Date();
  var htoday = today.setHours(0,0,0,0);
  const sheetURL = 'https://docs.google.com/spreadsheets/d/1q0xQlpadb9RfUDO11MUSW7h2eXwyuXk5E1k09goTPeQ/edit#gid=0&range=';

  for(let counter = 0; counter < invoices.length; counter++){
    if((!invoices[counter]['paid']) && (invoices[counter]['date'])){
      //Get persons team
      for(let sCounter = 0; sCounter < colleagues.length; sCounter++){
        if(invoices[counter]['responsible'] === colleagues[sCounter]['name']){
	  team = colleagues[sCounter]['team'];
     	}
      }
      if(zoom === team || zoom === 'ORG' || zoom === invoices[counter]['responsible']){
        //InitialDate date format
        dateFormat = invoices[counter]['date'].split('-');
        dateFormat = dateFormat[1] + '/' + dateFormat[0] + '/' + dateFormat[2];
        initialDate = new Date(dateFormat).setHours(0,0,0,0);
        goneDays = Math.round((new Date(htoday).setHours(0,0,0,0) - initialDate)/(1000*60*60*24));
        if(invoices[counter]['deadline']){
          //Deadline date format
          dateFormat = invoices[counter]['deadline'].split('-');
          deadLine = new Date(dateFormat[1] + '/' + dateFormat[0] + '/' + dateFormat[2]).setHours(0,0,0,0);
          if(deadLine < htoday ){
	          lateInvoices.push({name: invoices[counter]['responsible'], team: team, code: invoices[counter]['invoice_id'], date: invoices[counter]['date'],  code_url: (sheetURL + (counter + 2) + ':' + (counter + 2))});
	        }
        }
        else if(goneDays > 30){
          lateInvoices.push({name: invoices[counter]['responsible'], team: team, code: invoices[counter]['invoice_id'], date: invoices[counter]['date'], code_url: (sheetURL + (counter + 2) + ':' + (counter + 2))});
        }
      }
    }
  }
  //console.log('inf LateInvoices: ',lateInvoices);
  if(lateInvoices.length === 0){
    return [lateInvoices, true];
  }
  else{
    return [lateInvoices, false];
  }
}

																

export const GetCelebrations = (count, colleagues, zoom) => {
  let tCounter = 0;
  if(!zoom){
  zoom = 'ORG';
  }
  var showCelebrations;
  var showShowMore = true;
  const today = new Date(new Date().toDateString())  
  var thisYear = today.getFullYear();
  var celebrations = [];
  var celebrationsList = [];
  var calcDay, ordinalInc, showDate;
  let firstYearAdd;
  let tempDate;
  let sCounter = 0;
  tCounter = 0;
  //Check if zoom is on individual level
  for(let counter = 0; counter < colleagues.length;counter++){
    if(zoom === colleagues[counter]['name']){
      zoom = colleagues[counter]['team'];
      tCounter++;
    }
    tempDate = colleagues[counter]['birthday'].split(' ');
    tempDate[0] = getMonthFromString(tempDate[0])
    colleagues[counter]['birthday_calc'] = tempDate.join('/');
    tempDate = colleagues[counter]['start_date'].split(' ');
    tempDate[0] = getMonthFromString(tempDate[0])
    colleagues[counter]['start_date_calc'] = tempDate.join('/');
  }
  if(tCounter > 0){
    showCelebrations = false;
  }
  else{
    showCelebrations = true;
  }

 //Create celebrationsList
  //Create Pretext & showDate for birthdays
  for(let counter = 0; counter < colleagues.length * 2; counter++){
    if(counter < colleagues.length){
      if((colleagues[counter]['birthday'] && colleagues[counter]['team']) && (zoom === colleagues[counter]['team'] || zoom === 'ORG')){
        calcDay = colleagues[counter]['birthday'].split(' ');
	      if(calcDay[1].length === 1){
          if(calcDay[1] === '1'){ordinalInc = 'st ';}
          else if(calcDay[1] === '2'){ordinalInc = 'nd ';}
          else if(calcDay[1] === '3'){ordinalInc = 'rd ';}
          else{ordinalInc = 'th '}
        }
        else{
          if(calcDay[1] === '11' || calcDay[1] === '12' || calcDay[1] === '13'){ordinalInc = 'th ';}
          else if(calcDay[1].charAt(1) === '1'){ordinalInc = 'st ';}
          else if(calcDay[1].charAt(1) === '2'){ordinalInc = 'nd ';}
          else if(calcDay[1].charAt(1) === '3'){ordinalInc = 'rd ';}
          else{ordinalInc = 'th ';}
        }
        showDate = calcDay[0] + ' ' + calcDay[1] + ordinalInc;
	//push birthdays to celebrations
        celebrationsList.push({
        id: counter + 1,
        name: colleagues[counter]['name'],
        show_date: colleagues[counter]['birthday'],
        calc_date: new Date(colleagues[counter]['birthday_calc'] + '/' + thisYear),
        image_url: colleagues[counter]['image_url'],
        start_year: colleagues[counter]['start_year'],
        pretext: 'Birthday on ' + showDate
        });
      }
    }
    // Create Pretext & showDate for anniversarys
    else{
      if((colleagues[sCounter]['start_date'] && colleagues[sCounter]['team']) && (zoom === colleagues[sCounter]['team'] || zoom === 'ORG')){
	if((colleagues[sCounter]['start_year'] < thisYear) 
            || (today > new Date (colleagues[sCounter]['start_date'].split(' ').join('/') + '/' + thisYear))){
	  if(today > new Date (colleagues[sCounter]['start_date'].split(' ').join('/') + '/' + thisYear)){
	    firstYearAdd = 1;
          }
          else{
            firstYearAdd = 0;
          }
          calcDay = colleagues[sCounter]['start_date'].split(' ');
        if(calcDay[1].length === 1){
          if(calcDay[1] === '1'){ordinalInc = 'st ';}
          else if(calcDay[1] === '2'){ordinalInc = 'nd ';}
          else if(calcDay[1] === '3'){ordinalInc = 'rd ';}
          else{ordinalInc = 'th ';}
        }
        else{
          if(calcDay[1] === '11' || calcDay[1] === '12' || calcDay[1] === '13'){ordinalInc = 'th ';}
            else if(calcDay[1].charAt(1) === '1'){ordinalInc = 'st ';}
            else if(calcDay[1].charAt(1) === '2'){ordinalInc = 'nd ';}
            else if(calcDay[1].charAt(1) === '3'){ordinalInc = 'rd ';}
            else{ordinalInc = 'th ';}
          }
          showDate = calcDay[0] + ' ' + calcDay[1] + ordinalInc;
	  //push anniversaries to celebrations
          celebrationsList.push({
          id: counter + 1,
          name: colleagues[sCounter]['name'],
          show_date: colleagues[sCounter]['start_date'],
          calc_date: new Date (colleagues[sCounter]['start_date_calc'] + '/' + thisYear),
          image_url: colleagues[sCounter]['image_url'],
          start_year: colleagues[sCounter]['start_year'],
          pretext:((thisYear + firstYearAdd) - colleagues[sCounter]['start_year']) + ' year anniversary on ' + showDate
          });
          //sCounter++
        }
      }
    sCounter++;
    }
  }
  //Order celebrations array
  celebrationsList.sort((date1, date2) => date1.calc_date - date2.calc_date);
  //Cut/Move past events
  sCounter = 0;
  for (let counter = 0; counter < celebrationsList.length; counter++) {
    //console.log(celebrationsList[counter]['calc_date']);
    if(celebrationsList[counter]['calc_date'] < today){
      sCounter++;
    }
  }
  celebrationsList =  celebrationsList.concat(celebrationsList.splice(0, sCounter));
  // Create ClebrationsList based on list size:
  for(let counter = 0; counter < count; counter ++){
    if(counter < celebrationsList.length){
      celebrations.push(celebrationsList[counter]);
    }
    else{
      if(showShowMore !== false){
	showShowMore = false;
      }
    }
  }
  if(celebrations.length === celebrationsList.length){
    showShowMore = false;
  }

return [celebrations, showShowMore, showCelebrations];
}


//Scoreboard
export const GetScoreboard = (scorecards, clients, colleagues, currentZoom, invoices) => {
  if(scorecards.length !== 3){
    scorecards.push({id:3, name:'Colleagues', stat:'', change: '', changeType: '',changeShow:"false", reverse: false});
  }
  //Prep
  let yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  let prevYesterday = new Date(new Date().setFullYear(new Date().getFullYear() - 1))
  prevYesterday.setDate(prevYesterday.getDate() - 1);
  let currentTeamZoomMembers = [];
  let teamList = [];
  let listOfResponsible = [];
  let listOfTeams = [];
  var jsonCurrentTeamZoomMembers = colleagues.filter(function(value, index, arr){ 
    return value.team === currentZoom;
  });
  for(let counter = 0; counter < jsonCurrentTeamZoomMembers.length; counter++){
    currentTeamZoomMembers.push(jsonCurrentTeamZoomMembers[counter]['name'])
  }
  for(let counter = 0; counter < colleagues.length; counter++){
    if(colleagues[counter]['team']){
      if(!teamList.includes(colleagues[counter]['team'])){
        teamList.push(colleagues[counter]['team']);
      }
    }
  }
  var listOfClients = [];
  for(let counter = 0; counter < clients.length; counter++){
      if(clients[counter]['responsible'] && clients[counter]['name'] && (currentZoom === 'ORG' || clients[counter]['responsible'] === currentZoom || currentTeamZoomMembers.includes(clients[counter]['responsible']))){
          listOfClients.push(clients[counter]['name']);
          listOfResponsible.push(clients[counter]['responsible']);
          for(let sCounter = 0; sCounter < colleagues.length; sCounter++){
              if(clients[counter]['responsible'] === colleagues[sCounter]['name']){
                  listOfTeams.push(colleagues[sCounter]['team']);
              }
          }
      }
  }
  //Other 3 Scorecards
  const today = new Date();
  let previousDate = new Date(new Date().setFullYear(new Date().getFullYear() - 1));
  let strCurrentYear = today.getFullYear().toString().slice(-2);
  let strPreviousYear = (today.getFullYear() - 1).toString().slice(-2);
  let numberOfClients = 0;
  let tempDate;
  let teamMembers = [];
  let currentRevenue = 0;
  let previousRevenue = 0;
  var getTeamMembers = colleagues.filter(function(value, index, arr){ 
      return value.team === currentZoom;
    });
  for(let counter = 0; counter < getTeamMembers.length; counter++){
    teamMembers.push(getTeamMembers[counter]['name'])
  }
  
  //Get Clients
  for(let counter = 0; counter < clients.length; counter++){
    if(currentZoom === 'ORG' || clients[counter]['responsible'] === currentZoom || teamMembers.includes(clients[counter]['responsible'])){
      numberOfClients++;
    }
  }

  //Get Revenue
  for(let counter = 0; counter < invoices.length; counter++){
      if(invoices[counter]['revenue'] && invoices[counter]['responsible'] && invoices[counter]['date'] && (currentZoom === 'ORG' || invoices[counter]['responsible'] === currentZoom || teamMembers.includes(invoices[counter]['responsible']))){
        tempDate = invoices[counter]['date'].split('-');
        tempDate = new Date(tempDate[1] + '/' + tempDate[0] + '/' + tempDate[2]);
        if(invoices[counter]['date'].slice(-2) === strCurrentYear){
            currentRevenue += parseFloat(invoices[counter]['revenue']);
        }
        else if(invoices[counter]['date'].slice(-2) === strPreviousYear && tempDate <= previousDate){
            previousRevenue += parseFloat(invoices[counter]['revenue']);
        }
      }
  }
  //Calculate difference
  if(previousRevenue !== 0){
      if(currentRevenue > previousRevenue){
          scorecards[0]['changeType'] = 'increase';
          scorecards[0]['change'] = (Math.round((currentRevenue / previousRevenue - 1) * 100)) + '%';
      }
      else if(currentRevenue < previousRevenue){
          scorecards[0]['changeType'] = 'decrease';
          scorecards[0]['change'] = (Math.round((previousRevenue / currentRevenue - 1) * 100)) + '%';
      }
      else if(currentRevenue === previousRevenue){
          scorecards[0]['changeType'] = 'increase';
          scorecards[0]['change'] = '0%';
      }
  }
  else{
      scorecards[0]['changeType'] = 'increase';
      scorecards[0]['change'] = '0%';
  }

  //Update scoreboard
  scorecards[1]['stat'] = numberOfClients;
  scorecards[0]['stat'] = formatRevenue(currentRevenue);

  if(currentZoom === 'ORG'){
    scorecards[2]['stat'] = colleagues.length;
  }
  else if(teamMembers.length !== 0){
    scorecards[2]['stat'] = teamMembers.length;
  }
  else{
    scorecards.pop();
  }
  return scorecards;
}


function formatRevenue(revenue){
  revenue = revenue.toString();
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

export const GetChart = (invoices, colleagues, zoom, upcoming_raw) => {
  //console.log(upcoming_raw);
  var displayUpcoming = [0,0,0,0,0,0,0,0,0,0,0,0];
  var today = new Date();
  let currentYear = parseInt(today.getFullYear());
  let previousYear = currentYear - 1;
  currentYear = currentYear.toString();
  previousYear = previousYear.toString();
  var tempDate;
  var previousYearList = [0,0,0,0,0,0,0,0,0,0,0,0];
  var currentYearList = [0,0,0,0,0,0,0,0,0,0,0,0];
  var previousYearLost = [0,0,0,0,0,0,0,0,0,0,0,0];

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

  //Calculate current and previous revenue per month
  for(let counter = 0; counter < invoices.length; counter++){
    tempDate = invoices[counter]['date'].split('-');
    tempDate[0] = parseInt(tempDate[0]);
    tempDate[1] = parseInt(tempDate[1]);
    tempDate[2] = ("20" + tempDate[2]);
    if(zoom === 'ORG'){
      if(tempDate[2] === currentYear){
        currentYearList[tempDate[1] - 1] += parseInt(invoices[counter]['revenue']);
      }
      if(tempDate[2] === previousYear){
        previousYearList[tempDate[1] - 1] += parseInt(invoices[counter]['revenue']);
      }
    }
    else if(zoom === invoices[counter]['responsible']){
      if(tempDate[2] === currentYear){
        currentYearList[tempDate[1] - 1] += parseInt(invoices[counter]['revenue']);
      }
      if(tempDate[2] === previousYear){
        previousYearList[tempDate[1] - 1] += parseInt(invoices[counter]['revenue']);
      }
    }
    else{
      for(let sCounter = 0; sCounter < teamList.length; sCounter++){
        if(teamList[sCounter] === zoom){
          if(structureList[sCounter].includes(invoices[counter]['responsible'])){
            if(tempDate[2] === currentYear){
              currentYearList[tempDate[1] - 1] += parseInt(invoices[counter]['revenue']);
            }
            if(tempDate[2] === previousYear){
              previousYearList[tempDate[1] - 1] += parseInt(invoices[counter]['revenue']);
            }
          }
        }
      }
    }
  }

  //Calculate Expected Revenue and lost revenue
  if(zoom === 'ORG'){
    for(let counter = 0; counter < upcoming_raw.length; counter++){
      tempDate = upcoming_raw[counter]['send_date'].split('/');
      if(tempDate[2] === currentYear){
        displayUpcoming[parseInt(tempDate[0]) - 1] += upcoming_raw[counter]['revenue'];
      }
      else if(tempDate[2] === previousYear){
        previousYearLost[parseInt(tempDate[0]) - 1] += upcoming_raw[counter]['revenue'];
      }
    }
  }
  else if(teamList.includes(zoom)){
    for(let counter = 0; counter < teamList.length; counter++){
      if(zoom === teamList[counter]){
        for(let sCounter = 0; sCounter < upcoming_raw.length; sCounter++){
          tempDate = upcoming_raw[sCounter]['send_date'].split('/');
          if(structureList[counter].includes(upcoming_raw[sCounter]['responsible']) && tempDate[2] === currentYear){
            displayUpcoming[parseInt(tempDate[0]) - 1] += upcoming_raw[sCounter]['revenue'];
          }
          else if(structureList[counter].includes(upcoming_raw[sCounter]['responsible']) && tempDate[2] === previousYear){
            previousYearLost[parseInt(tempDate[0]) - 1] += upcoming_raw[sCounter]['revenue'];
          }
        }
      }
    }
  }
  else{
    for(let counter = 0; counter < upcoming_raw.length; counter++){
      tempDate = upcoming_raw[counter]['send_date'].split('/');
      if(zoom === upcoming_raw[counter]['responsible'] && tempDate[2] === currentYear){
        displayUpcoming[parseInt(tempDate[0]) - 1] += upcoming_raw[counter]['revenue'];
      }
      else if(zoom === upcoming_raw[counter]['responsible'] && tempDate[2] === previousYear){
        previousYearLost[parseInt(tempDate[0]) - 1] += upcoming_raw[counter]['revenue'];
      }
    }
  }

  var monthlyData = [
    ['Timeline', previousYear, currentYear, 'Expected'],
    ['Jan.', previousYearList[0],currentYearList[0],displayUpcoming[0]],
    ['Feb.', previousYearList[1],currentYearList[1],displayUpcoming[1]],
    ['Mar.', previousYearList[2],currentYearList[2],displayUpcoming[2]],
    ['Apr.', previousYearList[3],currentYearList[3],displayUpcoming[3]],
    ['May',  previousYearList[4],currentYearList[4],displayUpcoming[4]],
    ['Jun.', previousYearList[5],currentYearList[5],displayUpcoming[5]],
    ['Jul.', previousYearList[6],currentYearList[6],displayUpcoming[6]],
    ['Aug.', previousYearList[7],currentYearList[7],displayUpcoming[7]],
    ['Sep.', previousYearList[8],currentYearList[8],displayUpcoming[8]],
    ['Oct.', previousYearList[9],currentYearList[9],displayUpcoming[9]],
    ['Nov.', previousYearList[10],currentYearList[10],displayUpcoming[10]],
    ['Dec.', previousYearList[11],currentYearList[11],displayUpcoming[11]],
  ];

  //Create currentLostRevenue list
  var currentMonth = parseInt(today.getMonth())
  if(currentMonth === 0){
      currentMonth = 12;
  }
  let currentLostRevenue = [];
  for(let counter = 0; counter < currentMonth; counter++){
      currentLostRevenue.push(0);
      currentLostRevenue[counter] = displayUpcoming[counter];
  }

  var colorPalette = {previous: '#A9A9A9', current: '#C8692B', expected: '#D9D9D9', background: '#F3F3F3', text: '#6B6B6B', title: '#696969'};
  var monthlyChart = {
      legend: {
          data: [previousYear, currentYear, 'Expected']
      },      
      tooltip: {
          trigger: 'axis',
          axisPointer: {
              type: 'shadow'
          },
          valueFormatter: (value) => formatRevenue(value)
      },
      grid: {
          left: '3%',
          right: '3%',
          bottom: '3%',
          containLabel: true
      },
      dataset: {
          source: monthlyData
      },
      xAxis: { type: 'category', axisTick: { show: false }},
      yAxis: {type: 'value', axisLabel:{formatter: (value) => formatRevenue(value)}},
      series: [{ type: 'bar',color:colorPalette.previous }, { type: 'bar',color:colorPalette.current }, { type: 'bar',color:colorPalette.expected }]
  };
    
  var lostChart = {
    tooltip: {
      trigger: 'axis',
      valueFormatter: (value) => formatRevenue(value)
    },
    legend: {},
    grid: {
      left: '3%',
      right: '3%',
      bottom: '3%',
      containLabel: true
    },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    axisTick: { show: false },
    data: ['Jan.', 'Feb.', 'Mar.', 'Apr.', 'May', 'Jun.', 'Jul.', 'Aug.', 'Sep.', 'Oct.', 'Nov.', 'Dec.']
  },
  yAxis: {type: 'value', axisLabel:{formatter: (value) => formatRevenue(value)}},
  series: [
    {
      showSymbol: false,
      name: currentYear,
      type: 'line',
      color:colorPalette.current,
      data: currentLostRevenue,
    },
    {
      showSymbol: false,
      name: previousYear,
      type: 'line',
      color: colorPalette.previous,
      data: previousYearLost,
    },
    ]
  };
  
  return [monthlyChart, lostChart];
}


function getMonthFromString(mon){
  return new Date(Date.parse(mon +" 1, 2012")).getMonth()+1
}
