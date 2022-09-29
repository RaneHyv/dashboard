export const GetScorecards = (scorecards, currentZoom, invoices, colleagues, upcoming_raw) => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const previousYear = today.getFullYear() - 1;
    const lastDateOfCurrentYear = new Date(currentYear, 11, 31);
    const lastDateOfPreviousYear = new Date(previousYear, 11, 31);
    const previousDate = new Date(new Date().setFullYear(new Date().getFullYear() - 1));
    let strCurrentYear = today.getFullYear().toString().slice(-2);
    var currentMonth = parseInt(today.getMonth());
    let nextMonthDate = addMonths(1, today);
    let nextMonthStart = new Date(nextMonthDate.getFullYear(), nextMonthDate.getMonth(), 1);
    let nextMonthEnd = new Date(nextMonthDate.getFullYear(), nextMonthDate.getMonth() + 1, 0);
    let strPreviousYear = (today.getFullYear() - 1).toString().slice(-2);
    let tempDate;
    let teamMembers = [];
    let totalNextMonthUpcomming = [0, 0];
    let upcommingRevenue = [0, 0];
    let currentRevenue = 0;
    let previousRevenue = 0;
    let currentLostRevenue = 0;
    var getTeamMembers = colleagues.filter(function(value, index, arr){ 
        return value.team === currentZoom;
      });
    for(let counter = 0; counter < getTeamMembers.length; counter++){
        teamMembers.push(getTeamMembers[counter]['name'])
      }
    
    // Revenue
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
            //Upcoming compare
            if(tempDate >= previousDate.setHours(0,0,0,0) && tempDate <= lastDateOfPreviousYear){
              upcommingRevenue[1] += parseFloat(invoices[counter]['revenue']);
            }
        }
    }


    // Lost Revenue
    for(let counter = 0; counter < upcoming_raw.length; counter++){
        if(upcoming_raw[counter]['revenue'] && upcoming_raw[counter]['responsible'] && upcoming_raw[counter]['send_date'] && (currentZoom === 'ORG' || upcoming_raw[counter]['responsible'] === currentZoom || teamMembers.includes(upcoming_raw[counter]['responsible']))){
            var arrDate = upcoming_raw[counter]['send_date'].split('/');
            tempDate = new Date(upcoming_raw[counter]['send_date']);
            if(upcoming_raw[counter]['send_date'].slice(-2) === strCurrentYear && parseInt(arrDate[0]) <= currentMonth+1){
                currentLostRevenue += parseFloat(upcoming_raw[counter]['revenue']);
            }
            //Upcomming for this year
            if(tempDate >= today && tempDate <= lastDateOfCurrentYear){
              upcommingRevenue[0] += parseFloat(upcoming_raw[counter]['revenue']);
            }
            //Upcoming Confirmed
            if(nextMonthStart <= new Date(upcoming_raw[counter]['send_date']) && new Date(upcoming_raw[counter]['send_date']) <= nextMonthEnd && upcoming_raw[counter]['status'] === 'Confirmed'){
              totalNextMonthUpcomming[0]++;
              totalNextMonthUpcomming[1]++;
            }
            else if(nextMonthStart <= new Date(upcoming_raw[counter]['send_date']) && new Date(upcoming_raw[counter]['send_date']) <= nextMonthEnd){
              totalNextMonthUpcomming[1]++;
            }
        }
    }

    // Calculate difference Revenue
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

    //Calculate difference Upming revenue
    if(upcommingRevenue[1] !== 0){
      if(upcommingRevenue[0] > upcommingRevenue[1]){
          scorecards[3]['changeType'] = 'increase';
          scorecards[3]['change'] = (((upcommingRevenue[0] - upcommingRevenue[1])/ upcommingRevenue[1]) * 100).toFixed(1) + '%';
      }
      else if(upcommingRevenue[0] < upcommingRevenue[1]){
          scorecards[3]['changeType'] = 'decrease';
          scorecards[3]['change'] = (((upcommingRevenue[1] - upcommingRevenue[0])/ upcommingRevenue[0]) * 100).toFixed(1) + '%';
      }
      else if(upcommingRevenue[0] === upcommingRevenue[1]){
          scorecards[3]['changeType'] = 'increase';
          scorecards[3]['change'] = '0.0%';
      }
    }
    else{
        scorecards[3]['changeType'] = 'increase';
        scorecards[3]['change'] = '0.0%';
    }

    //Update Scorecard
    scorecards[0]['stat'] = formatRevenue(currentRevenue);
    scorecards[1]['stat'] = formatRevenue(currentLostRevenue);
    if(totalNextMonthUpcomming[1] === 0){
      scorecards[2]['stat'] = 0 + '%';
    }
    else{
      scorecards[2]['stat'] = Math.round(totalNextMonthUpcomming[0] / totalNextMonthUpcomming[1] * 100) + '%'
    }
    scorecards[3]['stat'] = formatRevenue(upcommingRevenue[0]);
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

  function addMonths(numOfMonths, date = new Date()) {
    const dateCopy = new Date(date.getTime());
    dateCopy.setMonth(dateCopy.getMonth() + numOfMonths);
    return dateCopy;
  }



export const GetChart = (invoices, colleagues, currentZoom, upcoming_raw) => {
  let displayUpcoming = [0,0,0,0,0,0,0,0,0,0,0,0];
  const today = new Date();
  const cCurrentYear = today.getFullYear();
  const lastDateOfCurrentYear = new Date(cCurrentYear, 11, 31);
  const firstDateOfCurrentYear = new Date(cCurrentYear, 0, 1);
  const startNextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
  const endNextMonth = new Date(today.getFullYear(), today.getMonth() + 2, 0);
  const previousTwoMonthsFromCurrentDate = addMonths(-2, today);
  const oneYearAgoDate = addMonths(-12, today);
  let previousYear = cCurrentYear - 1;
  let currentYear = cCurrentYear.toString();
  previousYear = previousYear.toString();
  let tempDate, tempMonth;
  let previousYearList = [0,0,0,0,0,0,0,0,0,0,0,0];
  let currentYearList = [0,0,0,0,0,0,0,0,0,0,0,0];
  let previousYearLost = [0,0,0,0,0,0,0,0,0,0,0,0];
  //[[not confirmed], [confirmed], [lost]]
  let currentYearUpcomingRevenueData = [[0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0]];

  //Get Quarter dates
  //qRealized, qUnrealized, [[Quarters], [Realized Value], [Unrealized Value]], yRealized, yUnrealized, [[Years], [Realized Value], [Unrealized Value]]
  let jsonQuarter = [{},{},[[],[],[]], {},{},[[],[],[]]];
  //Get quarters from 2014 to current year
  for(let counter = 2017; counter < cCurrentYear + 1; counter++){
    jsonQuarter[0][counter + 'Q1'] = 0;
    jsonQuarter[0][counter + 'Q2'] = 0;
    jsonQuarter[0][counter + 'Q3'] = 0;
    jsonQuarter[0][counter + 'Q4'] = 0;
    jsonQuarter[1][counter + 'Q1'] = 0;
    jsonQuarter[1][counter + 'Q2'] = 0;
    jsonQuarter[1][counter + 'Q3'] = 0;
    jsonQuarter[1][counter + 'Q4'] = 0;
    jsonQuarter[3][counter] = 0;
    jsonQuarter[4][counter] = 0;
  }

  //Next Month Revenue Chart:

  //Chart settings
  let labelFontSize = 14;
  //let chartTextAngle = 55;
  let quarterlyLabelSize = 10;
  let quarterlyLabelInterval = 0;
  if(window.innerWidth <= 640){
    labelFontSize = 12;
    //chartTextAngle = 65;
    quarterlyLabelSize = 12;
    quarterlyLabelInterval = 3;
  }

  //Get teams and team members
  let teamList = [];
  let completeList = [];
  let lateSendData = [];
  let latePaidTwoMonthsList = [];
  let currentTeamZoomMembers = [];
  let tempListWithData = {};
  let tempList = [];
  let tempListJSON = {};
  for(let counter = 0; counter < colleagues.length;counter++){
    if(colleagues[counter]['team']){
      if(!teamList.includes(colleagues[counter]['team'])){
        teamList.push(colleagues[counter]['team']);
      }
    }
    if(currentZoom === colleagues[counter]['team']){
      currentTeamZoomMembers.push(colleagues[counter]['name']);
    }
  }
  for(let counter = 0; counter < teamList.length;counter++){
    for(let sCounter = 0; sCounter < colleagues.length; sCounter++){
      if(colleagues[sCounter]['team'] === teamList[counter]){
        tempList.push(colleagues[sCounter]['name']);
        tempListWithData[colleagues[sCounter]['name']] = {total:0};
        tempListJSON[colleagues[sCounter]['name']] = {total:0, notconfirmed:0, confirmed:0, lost:0};
      }
    }
    //Total, NotConfirmed, Confirmed, Lost, teamName, teamMembers, teamMemberScores: NotConfirmed, Confirmed, Lost
    completeList.push([0, 0, 0, 0, teamList[counter], tempList, tempListJSON]);
    //Late Send: Setup -> total, team, teamMemberes, teamMemberScores
    lateSendData.push([0, teamList[counter], tempList, tempListWithData]);
    //Total Revenue, teamName, teamMembers
    latePaidTwoMonthsList.push([0, teamList[counter], tempList]);
    tempList = [];
    tempListJSON = {};
    tempListWithData = {};
  }
  //console.log(lateSendData);


  // Upcomming Revenue
  for(let sCounter = 0; sCounter < completeList.length; sCounter++){
    for(let counter = 0; counter < upcoming_raw.length; counter++){
      if(upcoming_raw[counter]['revenue'] && upcoming_raw[counter]['responsible'] && upcoming_raw[counter]['send_date'] && completeList[sCounter][5].includes(upcoming_raw[counter]['responsible'])){
        tempDate = new Date(upcoming_raw[counter]['send_date']);
        //Upcoming compare 
        if(tempDate >= startNextMonth && tempDate <= endNextMonth && upcoming_raw[counter]['status'] === 'Confirmed'){
          completeList[sCounter][2] += parseFloat(upcoming_raw[counter]['revenue']);
          completeList[sCounter][6][upcoming_raw[counter]['responsible']]["confirmed"] += parseFloat(upcoming_raw[counter]['revenue']);
        }
        else if(tempDate >= startNextMonth && tempDate <= endNextMonth && upcoming_raw[counter]['status'] === 'Lost'){
          completeList[sCounter][3] += parseFloat(upcoming_raw[counter]['revenue']);
          completeList[sCounter][6][upcoming_raw[counter]['responsible']]["lost"] += parseFloat(upcoming_raw[counter]['revenue']);
        }
        else if(tempDate >= startNextMonth && tempDate <= endNextMonth){
          completeList[sCounter][1] += parseFloat(upcoming_raw[counter]['revenue']);
          completeList[sCounter][6][upcoming_raw[counter]['responsible']]["notconfirmed"] += parseFloat(upcoming_raw[counter]['revenue']);
        }
        if(tempDate >= startNextMonth && tempDate <= endNextMonth){
          completeList[sCounter][0] += parseFloat(upcoming_raw[counter]['revenue']);
          completeList[sCounter][6][upcoming_raw[counter]['responsible']]["total"] += parseFloat(upcoming_raw[counter]['revenue']);
        }
        //Late Send: Get Data
        if(tempDate < today.setHours(0,0,0,0) && tempDate >= oneYearAgoDate && upcoming_raw[counter]['status'] !== 'Lost'){
          lateSendData[sCounter][0] += parseFloat(upcoming_raw[counter]['revenue']);
          lateSendData[sCounter][3][upcoming_raw[counter]['responsible']]["total"] += parseFloat(upcoming_raw[counter]['revenue']);
        }
      }

      //Upcoming current year revenue
      if(sCounter === 0 && upcoming_raw[counter]['revenue'] && upcoming_raw[counter]['responsible'] && upcoming_raw[counter]['send_date'] && (currentZoom === 'ORG' || currentZoom === upcoming_raw[counter]['responsible'] || currentTeamZoomMembers.includes(upcoming_raw[counter]['responsible']))){
        tempMonth = parseInt(upcoming_raw[counter]['send_date'].split('/')[0]) - 1;
        tempDate = new Date(upcoming_raw[counter]['send_date']);
        if(tempDate >= firstDateOfCurrentYear && tempDate <= lastDateOfCurrentYear && upcoming_raw[counter]['status'] === 'Confirmed'){
          currentYearUpcomingRevenueData[1][tempMonth] += parseFloat(upcoming_raw[counter]['revenue']);
        }
        else if(tempDate >= firstDateOfCurrentYear && tempDate <= lastDateOfCurrentYear && upcoming_raw[counter]['status'] === 'Lost'){
          currentYearUpcomingRevenueData[2][tempMonth] += parseFloat(upcoming_raw[counter]['revenue']);
        }
        else if(tempDate >= firstDateOfCurrentYear && tempDate <= lastDateOfCurrentYear){
          currentYearUpcomingRevenueData[0][tempMonth] += parseFloat(upcoming_raw[counter]['revenue']);
        }

        //Upcoming/Unrealized Quarterly & Yearly
        jsonQuarter[1][tempDate.getFullYear() + 'Q' + getQuarter(tempDate)] += parseInt(upcoming_raw[counter]['revenue']);
        jsonQuarter[4][tempDate.getFullYear()] += parseInt(upcoming_raw[counter]['revenue']);
      }
    }
  }


  let NextMonthRevenueDataNames = [];
  let NextMonthRevenueDataNotConfirmed = [];
  let NextMonthRevenueDataConfirmed = [];
  let NextMonthRevenueDataLost = [];
  let latePaidAllRevenueChartData = [[], []];
  let latePaidRevenueChartData = [[], []];
  let lateSendRevenueChartData = [[], []];
  let allLateSendRevenueChartData = [[], [], []];
  let allNextMonthRevenueChartData = [[], [], [], [], []];
  let showNextMonthRevenueChart = true;
  let showLatePaidAllRevenueChart = true;
  let showLatePaidRevenueChart = true;
  let showLateSendRevenueChart = true;
  let showAllLateSendRevenueChart = true;
  let showAllNextMonthRevenueChart = true;

  if(currentZoom === 'ORG'){
    completeList.sort(function(a, b){return a[0] - b[0]});
    for(let counter = 0; counter < completeList.length; counter++){
      NextMonthRevenueDataNames.push(completeList[counter][4]);
      NextMonthRevenueDataNotConfirmed.push(completeList[counter][1]);
      NextMonthRevenueDataConfirmed.push(completeList[counter][2]);
      NextMonthRevenueDataLost.push(completeList[counter][3]);
      //Next Month All: Get Data
      for (const obj in completeList[counter][6]) {
        if(completeList[counter][6][obj]['total'] !== 0){
          allNextMonthRevenueChartData[4].push([completeList[counter][6][obj]['total'], obj, completeList[counter][6][obj]['notconfirmed'],
          completeList[counter][6][obj]['confirmed'], completeList[counter][6][obj]['lost']]);
        }
      };
    }
    //Next Month All: Format Data
    if(allNextMonthRevenueChartData[4].length !== 0){
      allNextMonthRevenueChartData[4].sort(function(a, b){return a[0] - b[0]}).reverse();
      for(let counter = 0; counter < allNextMonthRevenueChartData[4].length; counter++){
        allNextMonthRevenueChartData[0].push(allNextMonthRevenueChartData[4][counter][1]);
        allNextMonthRevenueChartData[1].push(allNextMonthRevenueChartData[4][counter][2]);
        allNextMonthRevenueChartData[2].push(allNextMonthRevenueChartData[4][counter][3]);
        allNextMonthRevenueChartData[3].push(allNextMonthRevenueChartData[4][counter][4]);
      }
    }
    else{
      showAllNextMonthRevenueChart = false;
    }

    //Late Send: Format
    lateSendData.sort(function(a, b){return a[0] - b[0]});
    for(let counter = 0; counter < lateSendData.length; counter++){
      if(lateSendData[counter][0] !== 0){
        lateSendRevenueChartData[0].push(lateSendData[counter][0])
        lateSendRevenueChartData[1].push(lateSendData[counter][1])
      }
      //Late Send All: Get Data
      if(lateSendData[counter][0] !== 0){
        for (const obj in lateSendData[counter][3]) {
          if(lateSendData[counter][3][obj]['total'] !== 0){
            allLateSendRevenueChartData[2].push([lateSendData[counter][3][obj]['total'], obj]);
          }
        }
      }
    }
    //Late Send All: Format Data
    if(allLateSendRevenueChartData[2].length !== 0){
      allLateSendRevenueChartData[2].sort(function(a, b){return a[0] - b[0]}).reverse();
      for(let counter = 0; counter < allLateSendRevenueChartData[2].length; counter++){
        allLateSendRevenueChartData[0].push(allLateSendRevenueChartData[2][counter][1]);
        allLateSendRevenueChartData[1].push(allLateSendRevenueChartData[2][counter][0]);
      }
    }
    else{
      showAllLateSendRevenueChart = false;
    }
  }
  else if(teamList.includes(currentZoom)){
    for(let counter = 0; counter < completeList.length; counter++){
      if(completeList[counter][4] === currentZoom && completeList[counter][0] !== 0){
        completeList[counter][6] = sortByPosition(completeList[counter][6], 'total');
        for (const obj in completeList[counter][6]) {
          NextMonthRevenueDataNames.push(obj);
          NextMonthRevenueDataNotConfirmed.push(completeList[counter][6][obj]['notconfirmed']);
          NextMonthRevenueDataConfirmed.push(completeList[counter][6][obj]["confirmed"]);
          NextMonthRevenueDataLost.push(completeList[counter][6][obj]['lost']);
        };
      }
      else if(completeList[counter][4] === currentZoom && completeList[counter][0] === 0){
        showNextMonthRevenueChart = false;
      }
    }
    //Late Send: Format
    for(let counter = 0; counter < lateSendData.length; counter++){
      if(lateSendData[counter][1] === currentZoom && lateSendData[counter][0] !== 0){
        lateSendData[counter][3] = sortByPosition(lateSendData[counter][3], 'total');
        for (const obj in lateSendData[counter][3]) {
          lateSendRevenueChartData[0].push(lateSendData[counter][3][obj]['total']);
          lateSendRevenueChartData[1].push(obj);
        }
      }
    }

  }
  else{
    showNextMonthRevenueChart = false;
    showLateSendRevenueChart = false;
  }

  // Late Send: Remove view if empty
  if(lateSendRevenueChartData[0].length === 0){
    showLateSendRevenueChart = false;
  }

  // Late Send All: Remove view if empty / Limit View
  if(allLateSendRevenueChartData[0].length === 0){
    showAllLateSendRevenueChart = false;
  }

  // Next Month All: Remove view if empty / Limit View
  if(allNextMonthRevenueChartData[0].length === 0){
    showAllNextMonthRevenueChart = false;
  }

  //Remove chart if there is no data (array only has 0(s) )
  let showCurrentYearUpcommingRevenueChart = false;
  for(let counter = 0; counter < currentYearUpcomingRevenueData.length; counter++){
    if(currentYearUpcomingRevenueData[counter].find(forAboveZero) !== undefined){
      showCurrentYearUpcommingRevenueChart = true;
    }
  }


  
  //Monthly Revenue & Lost Revenue -------------------------------------------------------------------------------------
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
  
    let tempInvoiceDate;
    let latePaidTwoMonthsData = [[], []];
    //Calculate current and previous revenue per month
    for(let counter = 0; counter < invoices.length; counter++){
      tempDate = invoices[counter]['date'].split('-');
      tempInvoiceDate = new Date(tempDate[1] + '/' + tempDate[0] + '/20' + tempDate[2]);
      tempDate[0] = parseInt(tempDate[0]);
      tempDate[1] = parseInt(tempDate[1]);
      tempDate[2] = ("20" + tempDate[2]);
      

      //Late paid two months chart data claculation
      if(tempInvoiceDate < previousTwoMonthsFromCurrentDate && !invoices[counter]['paid'] && invoices[counter]['date'] && (currentZoom === 'ORG' || currentTeamZoomMembers.includes(invoices[counter]['responsible']))){
        latePaidTwoMonthsData[0].push(invoices[counter]['responsible']);
        latePaidTwoMonthsData.push({name: invoices[counter]['responsible'], revenue: parseInt(invoices[counter]['revenue'])});
      }

      //Quarterly & Yaerly Revenue 
      if(invoices[counter]['date'] && (currentZoom === 'ORG' || invoices[counter]['responsible'] === currentZoom || currentTeamZoomMembers.includes(invoices[counter]['responsible']))){
        jsonQuarter[0][tempDate[2] + 'Q' + getQuarter(tempInvoiceDate)] += parseInt(invoices[counter]['revenue']);
        jsonQuarter[3][tempDate[2]] += parseInt(invoices[counter]['revenue'])
      }

      if(currentZoom === 'ORG'){
        if(tempDate[2] === currentYear){
          currentYearList[tempDate[1] - 1] += parseInt(invoices[counter]['revenue']);
        }
        if(tempDate[2] === previousYear){
          previousYearList[tempDate[1] - 1] += parseInt(invoices[counter]['revenue']);
        }
      }
      else if(currentZoom === invoices[counter]['responsible']){
        if(tempDate[2] === currentYear){
          currentYearList[tempDate[1] - 1] += parseInt(invoices[counter]['revenue']);
        }
        if(tempDate[2] === previousYear){
          previousYearList[tempDate[1] - 1] += parseInt(invoices[counter]['revenue']);
        }
      }
      else{
        for(let sCounter = 0; sCounter < teamList.length; sCounter++){
          if(teamList[sCounter] === currentZoom){
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

    // Quarterly Chart json to array & limit view
    let showQuarterlyRevenueChart = false;
    for(let key in jsonQuarter[0]){
      if(jsonQuarter[0][key] !== 0 || jsonQuarter[0][key] !== 0 || showQuarterlyRevenueChart){
        jsonQuarter[2][0].push(key);
        jsonQuarter[2][1].push(jsonQuarter[0][key]);
        jsonQuarter[2][2].push(jsonQuarter[1][key]);
        if(!showQuarterlyRevenueChart){
          showQuarterlyRevenueChart = true;
        }
      }
    }
    // Quarterly Chart json to array & limit view
    let showYearlyRevenueChart = false;
    for(let key in jsonQuarter[3]){
      if(jsonQuarter[3][key] !== 0 || jsonQuarter[3][key] !== 0 || showYearlyRevenueChart){
        jsonQuarter[5][0].push(key);
        jsonQuarter[5][1].push(jsonQuarter[3][key]);
        jsonQuarter[5][2].push(jsonQuarter[4][key]);
        if(!showYearlyRevenueChart){
          showYearlyRevenueChart = true;
        }
      }
    }

    
    // Late paid two months chart: Remove namelist duplicates & calculate
    latePaidTwoMonthsData[0] = removeDuplicates(latePaidTwoMonthsData[0]);
    if(latePaidTwoMonthsData[0].length !== 0){
      let tempSum = 0;
      for(let counter = 0; counter < latePaidTwoMonthsData[0].length; counter++){
        tempSum = 0;
        for(let sCounter = 2; sCounter < latePaidTwoMonthsData.length; sCounter++){
          if(latePaidTwoMonthsData[0][counter] === latePaidTwoMonthsData[sCounter]['name']){
            tempSum += parseInt(latePaidTwoMonthsData[sCounter]['revenue']);
          }
        }
        //For teams
        for(let tCounter = 0; tCounter < latePaidTwoMonthsList.length; tCounter++){
          if(latePaidTwoMonthsList[tCounter][2].includes(latePaidTwoMonthsData[0][counter])){
            latePaidTwoMonthsList[tCounter][0] += tempSum;
          }
        }
        latePaidTwoMonthsData[1].push([tempSum, latePaidTwoMonthsData[0][counter]]);
      }

      //Sort
      latePaidTwoMonthsData[1].sort(function(a, b){return a[0] - b[0]}).reverse();
      latePaidTwoMonthsList.sort(function(a, b){return a[0] - b[0]});

      //Make Arrays for chart
      for(let counter = 0; counter < latePaidTwoMonthsData[1].length; counter++){
        latePaidAllRevenueChartData[0].push(latePaidTwoMonthsData[1][counter][1]);
        latePaidAllRevenueChartData[1].push(latePaidTwoMonthsData[1][counter][0]);
      }
      if(currentZoom === 'ORG'){
        for(let counter = 0; counter < latePaidTwoMonthsList.length; counter++){
          if(latePaidTwoMonthsList[counter][0] !== 0){
            latePaidRevenueChartData[0].push(latePaidTwoMonthsList[counter][1]);
            latePaidRevenueChartData[1].push(latePaidTwoMonthsList[counter][0]);
          }
        }
      }
      else{
        showLatePaidAllRevenueChart = false;
        latePaidRevenueChartData = latePaidAllRevenueChartData;
      }
    }
    else if(latePaidTwoMonthsData[0].length === 0){
      showLatePaidAllRevenueChart = false;
      showLatePaidRevenueChart = false;
    }

    //Calculate Expected Revenue and lost revenue
    if(currentZoom === 'ORG'){
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
    else if(teamList.includes(currentZoom)){
      for(let counter = 0; counter < teamList.length; counter++){
        if(currentZoom === teamList[counter]){
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
        if(currentZoom === upcoming_raw[counter]['responsible'] && tempDate[2] === currentYear){
          displayUpcoming[parseInt(tempDate[0]) - 1] += upcoming_raw[counter]['revenue'];
        }
        else if(currentZoom === upcoming_raw[counter]['responsible'] && tempDate[2] === previousYear){
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
  
    let monthlyChart, lostChart;
    let showMonthlyChart = false;
    let showLostChart = false;
    var colorPalette = {previous: '#A9A9A9', current: '#C8692B', expected: '#D9D9D9', background: '#F3F3F3', text: '#6B6B6B', title: '#696969'};

    //Monthly Revenue Chart:Check for empty
    for(let counter = 1; counter < monthlyData.length; counter++){
      if(monthlyData[counter][1] !== 0 || monthlyData[counter][2] !== 0 || monthlyData[counter][3] !== 0){
        showMonthlyChart = true;
      }
    }
    //Lost Revenue Chart:Check for empty
    for(let counter = 1; counter < previousYearLost.length; counter++){
      if(previousYearLost[counter] !== 0){
        showLostChart = true;
      }
    }
    for(let counter = 1; counter < currentLostRevenue.length; counter++){
      if(currentLostRevenue[counter] !== 0){
        showLostChart = true;
      }
    }
  
  if(showMonthlyChart === true){
    monthlyChart = {
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
  }
  if(showLostChart === true){
    lostChart = {
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
  }

    let nextMonthRevenueChart;
    if(showNextMonthRevenueChart && currentZoom === 'ORG'){
      nextMonthRevenueChart = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            // Use axis to trigger tooltip
            type: 'shadow' // 'shadow' as default; can also be 'line' or 'shadow'
          },
          valueFormatter: (value) => formatRevenue(value),
        },
        legend: {},
        grid: {
          left: '3%',
          right: '6%',
          bottom: '3%',
          top: '10%',
          containLabel: true
        },
        xAxis: {
          type: 'value',
          interval: 20000,
          axisLabel: {formatter: (value) => formatRevenue(value), fontSize: labelFontSize,},
        },
        yAxis: {
          type: 'category',
          axisTick: { show: false },
          axisLabel: {fontSize: labelFontSize},
          data: NextMonthRevenueDataNames,
        },
        series: [
          {
            name: 'Not Confirmed',
            type: 'bar',
            stack: 'total',
            label: {
              show: false,
              normal:{
                textStyle:{
                  fontSize: 16,
                },  
              }
            },
            emphasis: {
              focus: 'series'
            },
            color: '#D9D9D9',
            data: NextMonthRevenueDataNotConfirmed,
          },
          {
            name: 'Confirmed',
            type: 'bar',
            stack: 'total',
            label: {
              show: false,
              normal:{
                textStyle:{
                  fontSize: 16,
                },  
              }
            },
            emphasis: {
              focus: 'series'
            },
            color: '#C8692B',
            data: NextMonthRevenueDataConfirmed,
          },
          {
            name: 'Lost',
            type: 'bar',
            stack: 'total',
            label: {
              show: false,
              normal:{
                textStyle:{
                  fontSize: 16,
                },  
              }
            },
            emphasis: {
              focus: 'series'
            },
            color: '#A9A9A9',
            data: NextMonthRevenueDataLost,
          },
        ]
      };
    }
    else if(showNextMonthRevenueChart && currentZoom !== 'ORG'){
      nextMonthRevenueChart = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            // Use axis to trigger tooltip
            type: 'shadow' // 'shadow' as default; can also be 'line' or 'shadow'
          },
          valueFormatter: (value) => formatRevenue(value),
        },
        legend: {},
        grid: {
          left: '3%',
          right: '5%',
          bottom: '3%',
          top: '10%',
          containLabel: true
        },
        yAxis: {
          type: 'value',
          axisLabel: {formatter: (value) => formatRevenue(value), fontSize: labelFontSize,},
        },
        xAxis: {
          type: 'category',
          axisTick: { show: false },
          axisLabel: {fontSize: labelFontSize},
          data: NextMonthRevenueDataNames.reverse(),
        },
        series: [
          {
            name: 'Not Confirmed',
            type: 'bar',
            stack: 'total',
            label: {
              show: false,
              normal:{
                textStyle:{
                  fontSize: 16,
                },  
              }
            },
            emphasis: {
              focus: 'series'
            },
            color: '#D9D9D9',
            data: NextMonthRevenueDataNotConfirmed.reverse(),
          },
          {
            name: 'Confirmed',
            type: 'bar',
            stack: 'total',
            label: {
              show: false,
              normal:{
                textStyle:{
                  fontSize: 16,
                },  
              }
            },
            emphasis: {
              focus: 'series'
            },
            color: '#C8692B',
            data: NextMonthRevenueDataConfirmed.reverse(),
          },
          {
            name: 'Lost',
            type: 'bar',
            stack: 'total',
            label: {
              show: false,
              normal:{
                textStyle:{
                  fontSize: 16,
                },  
              }
            },
            emphasis: {
              focus: 'series'
            },
            color: '#A9A9A9',
            data: NextMonthRevenueDataLost.reverse(),
          },
        ]
      };
    }
    let currentMonthUpcomingRevenueChart;
    if(showCurrentYearUpcommingRevenueChart){
      currentMonthUpcomingRevenueChart = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            // Use axis to trigger tooltip
            type: 'shadow' // 'shadow' as default; can also be 'line' or 'shadow'
          },
          valueFormatter: (value) => formatRevenue(value),
        },
        legend: {},
        grid: {
          left: '3%',
          right: '5%',
          bottom: '3%',
          top: '12%',
          containLabel: true
        },
        yAxis: {
          type: 'value',
          axisLabel: {formatter: (value) => formatRevenue(value), fontSize: labelFontSize,},
        },
        xAxis: {
          type: 'category',
          axisTick: { show: false },
          axisLabel: {fontSize: labelFontSize},
          data: ['Jan.', 'Feb.', 'Mar.', 'Apr.', 'May', 'Jun.', 'Jul.', 'Aug.', 'Sep.', 'Oct.', 'Nov.', 'Dec.'],
        },
        series: [
          {
            name: 'Lost',
            type: 'bar',
            stack: 'total',
            label: {
              show: false,
              normal:{
                textStyle:{
                  fontSize: 16,
                },  
              }
            },
            emphasis: {
              focus: 'series'
            },
            color: '#A9A9A9',
            data: currentYearUpcomingRevenueData[2],
          },
          {
            name: 'Confirmed',
            type: 'bar',
            stack: 'total',
            label: {
              show: false,
              normal:{
                textStyle:{
                  fontSize: 16,
                },  
              }
            },
            emphasis: {
              focus: 'series'
            },
            color: '#C8692B',
            data: currentYearUpcomingRevenueData[1],
          },
          {
            name: 'Not Confirmed',
            type: 'bar',
            stack: 'total',
            label: {
              show: false,
              normal:{
                textStyle:{
                  fontSize: 16,
                },  
              }
            },
            emphasis: {
              focus: 'series'
            },
            color: '#D9D9D9',
            data: currentYearUpcomingRevenueData[0],
          },
        ]
      };
    }
    let latePaidAllRevenueChart;
    if(showLatePaidAllRevenueChart){
      latePaidAllRevenueChart = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          },
          valueFormatter: (value) => formatRevenue(value),
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
            data: latePaidAllRevenueChartData[0],
            axisLabel: {fontSize: labelFontSize,},
            axisTick: { show: false },
          }
        ],
        yAxis: [
          {
            type: 'value',
            axisLabel: {formatter: (value) => formatRevenue(value), fontSize: labelFontSize},
          }
        ],
        series: [
          {
            name: 'Revenue',
            type: 'bar',
            barWidth: '60%',
            data: latePaidAllRevenueChartData[1],
            color: '#C8692B',
          }
        ]
      };
    }
    let latePaidRevenueChart;
    if(showLatePaidRevenueChart && currentZoom === 'ORG'){
      latePaidRevenueChart = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          },
          valueFormatter: (value) => formatRevenue(value),
        },
        grid: {
          left: '3%',
          right: '6%',
          bottom: '3%',
          top: '5%',
          containLabel: true
        },
        xAxis: {
          type: 'value',
          boundaryGap: [0, 0.01],
          axisLabel: {formatter: (value) => formatRevenue(value), fontSize: labelFontSize,},
        },
        yAxis: {
          type: 'category',
          data: latePaidRevenueChartData[0],
          axisTick: { show: false },
          axisLabel: {fontSize: labelFontSize},
        },
        series: [
          {
            name: 'Revenue',
            type: 'bar',
            data: latePaidRevenueChartData[1],
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
    }
    else if(showLatePaidRevenueChart && currentZoom !== 'ORG'){
      latePaidRevenueChart = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          },
          valueFormatter: (value) => formatRevenue(value),
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
            data: latePaidAllRevenueChartData[0],
            axisLabel: {fontSize: labelFontSize,},
            axisTick: { show: false },
          }
        ],
        yAxis: [
          {
            type: 'value',
            axisLabel: {formatter: (value) => formatRevenue(value), fontSize: labelFontSize},
          }
        ],
        series: [
          {
            name: 'Revenue',
            type: 'bar',
            barWidth: '60%',
            data: latePaidAllRevenueChartData[1],
            color: '#C8692B',
          }
        ]
      };
    }

    let lateSendRevenueChart;
    if(showLateSendRevenueChart && currentZoom === 'ORG'){
      lateSendRevenueChart = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          },
          valueFormatter: (value) => formatRevenue(value),
        },
        grid: {
          left: '3%',
          right: '6%',
          bottom: '3%',
          top: '5%',
          containLabel: true
        },
        xAxis: {
          type: 'value',
          boundaryGap: [0, 0.01],
          axisLabel: {formatter: (value) => formatRevenue(value), fontSize: labelFontSize,},
        },
        yAxis: {
          type: 'category',
          data: lateSendRevenueChartData[1],
          axisTick: { show: false },
          axisLabel: {fontSize: labelFontSize},
        },
        series: [
          {
            name: 'Revenue',
            type: 'bar',
            data: lateSendRevenueChartData[0],
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
    }
    else if(showLateSendRevenueChart && currentZoom !== 'ORG'){
      lateSendRevenueChart = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          },
          valueFormatter: (value) => formatRevenue(value),
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
            data: lateSendRevenueChartData[1].reverse(),
            axisLabel: {fontSize: labelFontSize,},
            axisTick: { show: false },
          }
        ],
        yAxis: [
          {
            type: 'value',
            axisLabel: {formatter: (value) => formatRevenue(value), fontSize: labelFontSize},
          }
        ],
        series: [
          {
            name: 'Revenue',
            type: 'bar',
            barWidth: '60%',
            data: lateSendRevenueChartData[0].reverse(),
            color: '#C8692B',
          }
        ]
      };
    }

    let quarterlyRevenueChart;
    if(showQuarterlyRevenueChart){
      quarterlyRevenueChart = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          },
          valueFormatter: (value) => formatRevenue(value),
        },
        legend: {},
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          top: '10%',
          containLabel: true
        },
        xAxis: [
          {
            type: 'category',
            data: jsonQuarter[2][0],
            axisLabel: {fontSize: quarterlyLabelSize,  interval: quarterlyLabelInterval, rotate: 90,},
            axisTick: { show: false },
          }
        ],
        yAxis: [
          {
            type: 'value',
            axisLabel: {formatter: (value) => formatRevenue(value), fontSize: labelFontSize},
          }
        ],
        series: [
          {
            name: 'Realized',
            type: 'bar',
            barWidth: '60%',
            data: jsonQuarter[2][1],
            color: '#C8692B',
          },
          {
            name: 'Unrealized',
            type: 'line',
            showSymbol: false,
            data: jsonQuarter[2][2],
            color: '#A9A9A9',
          }
        ]
      };
    }
    
    let yearlyRevenueChart;
    if(showYearlyRevenueChart){
      yearlyRevenueChart = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          },
          valueFormatter: (value) => formatRevenue(value),
        },
        legend: {},
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          top: '10%',
          containLabel: true
        },
        xAxis: [
          {
            type: 'category',
            data: jsonQuarter[5][0],
            axisLabel: {fontSize: labelFontSize},
            axisTick: { show: false },
          }
        ],
        yAxis: [
          {
            type: 'value',
            axisLabel: {formatter: (value) => formatRevenue(value), fontSize: labelFontSize},
          }
        ],
        series: [
          {
            name: 'Realized',
            type: 'bar',
            barWidth: '60%',
            data: jsonQuarter[5][1],
            color: '#C8692B',
          },
          {
            name: 'Unrealized',
            type: 'line',
            showSymbol: false,
            data: jsonQuarter[5][2],
            color: '#A9A9A9',
          }
        ]
      };
    }
    let allLateSendRevenueChart;
    if(showAllLateSendRevenueChart){
      allLateSendRevenueChart = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          },
          valueFormatter: (value) => formatRevenue(value),
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
            data: allLateSendRevenueChartData[0],
            axisLabel: {fontSize: labelFontSize,  interval: 0, rotate: 90,},
            axisTick: { show: false },
          }
        ],
        yAxis: [
          {
            type: 'value',
            axisLabel: {formatter: (value) => formatRevenue(value), fontSize: labelFontSize},
          }
        ],
        series: [
          {
            name: 'Revenue',
            type: 'bar',
            barWidth: '60%',
            data: allLateSendRevenueChartData[1],
            color: '#C8692B',
          }
        ]
      };
    }

    let allNextMonthRevenueChart;
    if(showAllNextMonthRevenueChart){
      allNextMonthRevenueChart = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            // Use axis to trigger tooltip
            type: 'shadow' // 'shadow' as default; can also be 'line' or 'shadow'
          },
          valueFormatter: (value) => formatRevenue(value),
        },
        legend: {},
        grid: {
          left: '3%',
          right: '5%',
          bottom: '3%',
          top: '12%',
          containLabel: true
        },
        yAxis: {
          type: 'value',
          axisLabel: {formatter: (value) => formatRevenue(value), fontSize: labelFontSize,},
        },
        xAxis: {
          type: 'category',
          axisTick: { show: false },
          axisLabel: {fontSize: labelFontSize,  interval: 0, rotate: 90,},
          data: allNextMonthRevenueChartData[0],
        },
        series: [
          {
            name: 'Lost',
            type: 'bar',
            stack: 'total',
            label: {
              show: false,
              normal:{
                textStyle:{
                  fontSize: 16,
                },  
              }
            },
            emphasis: {
              focus: 'series'
            },
            color: '#A9A9A9',
            data: allNextMonthRevenueChartData[3],
          },
          {
            name: 'Confirmed',
            type: 'bar',
            stack: 'total',
            label: {
              show: false,
              normal:{
                textStyle:{
                  fontSize: 16,
                },  
              }
            },
            emphasis: {
              focus: 'series'
            },
            color: '#C8692B',
            data: allNextMonthRevenueChartData[2],
          },
          {
            name: 'Not Confirmed',
            type: 'bar',
            stack: 'total',
            label: {
              show: false,
              normal:{
                textStyle:{
                  fontSize: 16,
                },  
              }
            },
            emphasis: {
              focus: 'series'
            },
            color: '#D9D9D9',
            data: allNextMonthRevenueChartData[1],
          },
        ]
      };
    }

    return [monthlyChart, lostChart, nextMonthRevenueChart, currentMonthUpcomingRevenueChart, 
      latePaidAllRevenueChart, latePaidRevenueChart, quarterlyRevenueChart, yearlyRevenueChart, 
      lateSendRevenueChart, allLateSendRevenueChart, allNextMonthRevenueChart];
  }


  //Sort JSON Function
  const sortByPosition = (obj,name) => {
    const order = [], res = {};
    Object.keys(obj).forEach(key => {
       return order[obj[key][name] - 1] = key;
    });
    order.forEach(key => {
       res[key] = obj[key];
    });
    return res;
  }

  //Find function to find if array has only 0 number(s)
  function forAboveZero(number) {
    return number !== 0;
  }

  //Remove duplicates from array
  function removeDuplicates(arr) {
    return arr.filter((item,
        index) => arr.indexOf(item) === index);
  }

  //Get Quarter of date
  function getQuarter(date = new Date()) {
    return Math.floor(date.getMonth() / 3 + 1);
  }


  export const GetLateInvoices = (invoices, colleagues, zoom) => {
    var lateInvoices = [];
    lateInvoices = [];
    var dateFormat,deadLine, initialDate, team, goneDays;
    const today = new Date();
    var currentYear = today.getFullYear();
    const htoday = today.setHours(0,0,0,0);
    const sheetURL = 'https://docs.google.com/spreadsheets/d/164PqwNe8UPCVWwz-H9LHsfHEqT6BKI_uL9V41najEuM/edit#gid=0&range=A';
    let correctionSheet;
  
    for(let counter = 0; counter < invoices.length; counter++){
      if((!invoices[counter]['paid']) && (invoices[counter]['date'])){
        //Get persons team
        for(let sCounter = 0; sCounter < colleagues.length; sCounter++){
          if(invoices[counter]['responsible'] === colleagues[sCounter]['name']){
        team = colleagues[sCounter]['team'];
           }
        }
        correctionSheet = currentYear-invoices[counter]['invoice_id'].substring(0, 4);
        if(zoom === team || zoom === 'ORG' || zoom === invoices[counter]['responsible']){
            //InitialDate date format
            dateFormat = invoices[counter]['date'].split('-');
            dateFormat = dateFormat[1] + '/' + dateFormat[0] + '/' + dateFormat[2];
            initialDate = new Date(dateFormat);
            goneDays = Math.round((new Date(htoday) - initialDate)/(1000*60*60*24));
            if(invoices[counter]['deadline']){
                //Deadline date format
                dateFormat = invoices[counter]['deadline'].split('-');
                deadLine = new Date(dateFormat[1] + '/' + dateFormat[0] + '/' + dateFormat[2]);
                if(deadLine < htoday ){
                    lateInvoices.push({name: invoices[counter]['responsible'], team: team, code: invoices[counter]['invoice_id'], date: invoices[counter]['date'],  code_url: (sheetURL + (counter + 3 + correctionSheet))});
                }
            }
            else if(goneDays > 30){
                lateInvoices.push({name: invoices[counter]['responsible'], team: team, code: invoices[counter]['invoice_id'], date: invoices[counter]['date'], code_url: (sheetURL + (counter + 3 + correctionSheet)) });
            }
        }
      }
    }
    //console.log('inf LateInvoices: ',lateInvoices);
    if(lateInvoices.length === 0){
      return '';
    }
    else{
      return lateInvoices;
    }
  }


  export const FilterCharts = (selection, currentZoom, chartList) => {
    let titleList = [];
    let returnTitleList = [];
    let returnChartList = [];
    // Current Year Revenue
    if(selection === 0){
      titleList = [
        'Monthly revenue',
        'Upcoming revenue'
      ];
    }
    // Yearly/Monthly Revenue
    if(selection === 1){
      titleList = [
        'Quarterly revenue',
        'Yearly revenue'
      ];
    }
    // Next Month Revenue
    if(currentZoom === 'ORG' && selection === 2){
      titleList = [
        'Next month revenue per team',
        'Next month revenue per person'
      ];
    }
    else if(selection === 2){
      titleList = [
        'Next month revenue per team member',
        'Next month revenue per person'
      ];
    }
    //Late Paid Revenue
    if(currentZoom === 'ORG' && selection === 3){
      titleList = [
        'Late paid per team',
        'Late paid per person'
      ];
    }
    else if(selection === 3){
      titleList = [
        'Late paid per team member',
        'Late paid per person'
      ];
    }
    //Late Send Revenue
    if(currentZoom === 'ORG' && selection === 4){
      titleList = [
        'Late send per team',
        'Late send per person'
      ];
    }
    else if(selection === 4){
      titleList = [
        'Late send per team member',
        'Late send per person'
      ];
    }
    
    for (let counter = 0; counter < chartList.length; counter++){
      if(chartList[counter]){
        returnTitleList.push(titleList[counter]);
        returnChartList.push(chartList[counter]);
        //console.log(returnTitleList, returnChartList, counter);
      }
    }
  
    return [returnTitleList, returnChartList];
  }