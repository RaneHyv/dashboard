var openIcon = '▼';
var closeIcon = '▶';
//var openIcon = '\u25bc';
//var closeIcon = '\u25b6';

export const SidebarSettings = () => {
  //const pathname = window.location.pathname
  var navigation = [];
  navigation = [
    { key:'org', label: 'ORG', href: '/org',openedIcon: openIcon, closedIcon: closeIcon, nodes:[{key:'loading', label:'Loading...', openedIcon: openIcon, closedIcon: closeIcon, nodes: [{ key:'loading', label: 'Loading...' }]}]},
    { key:'feedback', label: 'Feedback', href: '/feedback',},
    ]
  return navigation;
}

export const UpdateSidebarSettings = (navigation, colleagues) => {
  var peopleList = [];
  var teamList = [];
  var navlist = [];
  var urlList = ['/org'];
  //var path = window.location.pathname.replaceAll('-',' ').split('/').filter(function(entry) { return entry.trim() !== ''; });

  for(let counter = 0; counter < colleagues.length;counter++){
    if(colleagues[counter]['team']){
      if(!teamList.includes(colleagues[counter]['team'])){
        teamList.push(colleagues[counter]['team']);
      }
    }
  }
  

  for(let counter = 0; counter < teamList.length; counter++){
    for(let sCounter = 0; sCounter < colleagues.length; sCounter++){
      if(colleagues[sCounter]['team'] === teamList[counter]){
        peopleList.push({key: colleagues[sCounter]['name'].toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""), label: colleagues[sCounter]['name'],
        href: ('/org/' + colleagues[sCounter]['team'].toLowerCase().replaceAll(' ','-') 
        + '/' + colleagues[sCounter]['name'].toLowerCase().replaceAll(' ','-')).normalize("NFD").replace(/[\u0300-\u036f]/g, ""),
        openedIcon: openIcon, closedIcon: closeIcon});
	urlList.push(('/org/' + colleagues[sCounter]['team'].toLowerCase().replaceAll(' ','-')+ '/' + colleagues[sCounter]['name'].toLowerCase().replaceAll(' ','-')).normalize("NFD").replace(/[\u0300-\u036f]/g, ""));
      }
    }
    navlist.push({key: teamList[counter].toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""), label: teamList[counter],
    href: ('/org/' + teamList[counter].toLowerCase().replaceAll(' ','-')).normalize("NFD").replace(/[\u0300-\u036f]/g, ""),
    nodes: peopleList, openedIcon: openIcon, closedIcon: closeIcon});
    peopleList = [];
    urlList.push(('/org/' + teamList[counter].toLowerCase().replaceAll(' ','-')).normalize("NFD").replace(/[\u0300-\u036f]/g, ""));
  }
  navigation[0]['nodes'] = navlist;
  //console.log(urlList);
  //console.log(navigation);
  return [navigation, urlList];
}


export const GetZoom = (currentZoom, colleagues) => {
  //console.log(currentZoom);
  var correctZoom;
  if(currentZoom === 'ORG'){
    return 'ORG';
  }
  for(let counter = 0; counter < colleagues.length; counter++){
    if(colleagues[counter]['team'].normalize("NFD").replace(/[\u0300-\u036f]/g, "") === currentZoom){
      correctZoom = colleagues[counter]['team'];
    }
    else if(colleagues[counter]['name'].normalize("NFD").replace(/[\u0300-\u036f]/g, "") === currentZoom){
      correctZoom = colleagues[counter]['name'];
    }
  }
  //console.log(correctZoom);
  return correctZoom;
}


export const FetchData = async () => {
  //console.log('in fetch process');
  var dataList = [];
  var urls = [];
  if(String(window.location).includes('localhost:')){
    var base = window.location.protocol + "//" + window.location.host.slice(0, -1) + '9';
    urls = [ base + '/back/colleagues', base + '/back/invoices', base + '/back/clients', base + '/back/lost-clients', base + '/back/all-colleagues', base + '/back/upcoming', base + '/back/notifications']
  }
  else{
    urls = ['/back/colleagues','/back/invoices', '/back/clients', '/back/lost-clients', '/back/all-colleagues', '/back/upcoming', '/back/notifications']
  }
  await Promise.all(urls.map(async url => {
    const resp = await fetch(url);
    const data = await resp.json();
    dataList = {...dataList, ...data};
  }));
  return dataList;
}


export const GetClient = (currentClient, clients) => {
  for(let counter = 0; counter < clients.length; counter++){
    if(clients[counter]['name'].toLowerCase().replaceAll(' - ',' ').normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z ]/g, "").replaceAll(' ','-').replaceAll('--','-') === currentClient){
      return clients[counter]['name'];
    }
  }
  return '';
}
