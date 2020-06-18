
interface CustomVisitItem {
  historyId: string,
  visitId: string,
  referringVisitId: string,
  transition: string,
  visitTime: Date,
  url: string,
  title: string
}

const MAX_URL_SIZE = 20;
const MAX_TITLE_SIZE = 20


const days = 7;
const microsecondsBack = 1000 * 60 * 60 * 24 * days;
const startTime = (new Date).getTime() - microsecondsBack;

function renderVisit(visit: CustomVisitItem) : HTMLElement {
  let tr = document.createElement('tr')
  let columns = [visit.visitTime.toISOString(), visit.title.substring(0,MAX_TITLE_SIZE), visit.url.substring(0,MAX_URL_SIZE), visit.transition, visit.referringVisitId, visit.visitId, visit.historyId]
  columns.forEach((text) => {
    let td = document.createElement('td')
    td.appendChild(document.createTextNode(text))
    tr.appendChild(td)
  })
  return tr
}

const render = (allVisits: CustomVisitItem[]) => {
  let table = document.createElement('table')
  let tbody = document.createElement('tbody')
  allVisits.forEach((visit: CustomVisitItem) => {
    tbody.appendChild(renderVisit(visit))
  })
  table.appendChild(tbody)
  document.body.appendChild(table);
}

window.addEventListener('DOMContentLoaded', (event) => {
  let allVisits : CustomVisitItem[] = [];
  let lastSize = 0;
  chrome.history.search({
    'text': '', 
    maxResults: 0, 
    startTime: startTime}, (historyItems: chrome.history.HistoryItem[]) => {
    historyItems.forEach((historyItem) => {
      chrome.history.getVisits({url: historyItem.url}, (visits: chrome.history.VisitItem[]) => {
        let realVisits = visits.filter((visit) => visit.id === historyItem.id)
        realVisits.forEach((visit) => {
          let customVisit: CustomVisitItem = {
            historyId: visit.id,
            visitId: visit.visitId,
            referringVisitId: visit.referringVisitId,
            transition: visit.transition,
            visitTime: new Date(visit.visitTime),
            url: historyItem.url,
            title: historyItem.title
          }
          allVisits.push(customVisit)
        })
      })
    })
  })

  let timerId = setInterval(() => {
    if (allVisits.length > lastSize) {
      lastSize = allVisits.length
    } else {
      render(allVisits
        .sort((a: CustomVisitItem,b: CustomVisitItem) => b.visitTime.getTime() - a.visitTime.getTime())
        .filter((i,idx) => idx > 0 && allVisits[idx-1].url !== i.url)
      )
      clearInterval(timerId)
    }
  }, 100)

  
});

