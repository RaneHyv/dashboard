export const GetLateInvoices = (zoom, invoices, colleagues) => {
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
        if(zoom === invoices[counter]['responsible']){
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
      return 0;
    }
    else{
      return lateInvoices.length;
    }
  }

  export const GetNotifications = (currentZoom, notifications, lateInvoiceNumber, colleagues) => {
    let notificationsList = [[],[],[],[]];
    let positiveNotifications = [[],[],[],[]];
    let negativeNotifications = [[],[],[],[]];
    let neutralNotifications = [[],[],[],[]];
    let colleagueList = [];
    for(let counter = 0; counter < colleagues.length; counter++){
        colleagueList.push(colleagues[counter]['name']);
    }
    if(colleagueList.includes(currentZoom)){
        if(lateInvoiceNumber > 0){
            negativeNotifications[0].push('There are ' + lateInvoiceNumber + ' late invoices that need your attention');
            negativeNotifications[1].push('Next');
        }
        if(notifications.length > 0){
            for(let counter = 0; counter < notifications.length; counter++){
                if(notifications[counter]['person'] === currentZoom && notifications[counter]['importance'].toLowerCase() === 'yes'){
                    notificationsList[0].push(notifications[counter]['message']);
                    notificationsList[1].push('Done');
                    notificationsList[2].push(notifications[counter]['person']);
                    notificationsList[3].push(notifications[counter]['id']);
                }
                else if(notifications[counter]['person'] === currentZoom && notifications[counter]['nature'].toLowerCase() === 'positive'){
                    positiveNotifications[0].push(notifications[counter]['message']);
                    positiveNotifications[1].push('Done');
                    positiveNotifications[2].push(notifications[counter]['person']);
                    positiveNotifications[3].push(notifications[counter]['id']);
                }
                else if(notifications[counter]['person'] === currentZoom && notifications[counter]['nature'].toLowerCase() === 'negative'){
                    negativeNotifications[0].push(notifications[counter]['message']);
                    negativeNotifications[1].push('Done');
                    negativeNotifications[2].push(notifications[counter]['person']);
                    negativeNotifications[3].push(notifications[counter]['id']);
                }
                else if(notifications[counter]['person'] === currentZoom){
                    neutralNotifications[0].push(notifications[counter]['message']);
                    neutralNotifications[1].push('Done');
                    neutralNotifications[2].push(notifications[counter]['person']);
                    neutralNotifications[3].push(notifications[counter]['id']);
                }
            }
            for(let counter = 0; counter < notifications.length + 1; counter++){
                if(positiveNotifications[0][counter]){
                    notificationsList[0].push(positiveNotifications[0][counter]);
                    notificationsList[1].push(positiveNotifications[1][counter]);
                    notificationsList[2].push(positiveNotifications[2][counter]);
                    notificationsList[3].push(positiveNotifications[3][counter]);
                }
                if(neutralNotifications[0][counter]){
                    notificationsList[0].push(neutralNotifications[0][counter]);
                    notificationsList[1].push(neutralNotifications[1][counter]);
                    notificationsList[2].push(neutralNotifications[2][counter]);
                    notificationsList[3].push(neutralNotifications[3][counter]);
                }
                if(negativeNotifications[0][counter]){
                    notificationsList[0].push(negativeNotifications[0][counter]);
                    notificationsList[1].push(negativeNotifications[1][counter]);
                    notificationsList[2].push(negativeNotifications[2][counter]);
                    notificationsList[3].push(negativeNotifications[3][counter]);
                }
            }
        }
        notificationsList[0].push('Congrats, you have completed all the tasks');
        notificationsList[1].push('Close');
    }
    return notificationsList;
}

