import { renderHistory, IHistoryItem } from 'lumos-history';

const days = 7;
const microsecondsBack = 1000 * 60 * 60 * 24 * days;
const startTime = (new Date).getTime() - microsecondsBack;

window.addEventListener('DOMContentLoaded', () => {
  let allVisits : IHistoryItem[] = [];
  let lastSize = 0;

  const historyContainer = document.createElement('div');
  document.body.append(historyContainer);

  chrome.history.search(
    {
      'text': '', 
      maxResults: 0, 
      startTime: startTime
    }, 
    (historyItems: chrome.history.HistoryItem[]) => {
      historyItems.forEach((historyItem) => {
        if (!historyItem.url) {
          return;
        }

        chrome.history.getVisits({url: historyItem.url}, (visits: chrome.history.VisitItem[]) => {
          let realVisits = visits.filter((visit) => visit.id === historyItem.id)
          realVisits.forEach((visit) => {
            let customVisit: IHistoryItem = {
              historyId: visit.id,
              visitId: visit.visitId,
              referringVisitId: visit.referringVisitId,
              transition: visit.transition,
              visitTime: visit.visitTime ?? 0,
              url: historyItem.url ?? '',
              title: historyItem.title ?? '',
            }
            allVisits.push(customVisit)
          })
        });
      })
    }
  );

  let timerId = setInterval(() => {
    if (allVisits.length > lastSize) {
      lastSize = allVisits.length
    } else {
      const visits = allVisits
      .sort((a: IHistoryItem,b: IHistoryItem) => b.visitTime - a.visitTime)
      .filter((i,idx) => idx > 0 && allVisits[idx-1].url !== i.url);

      renderHistory(historyContainer, visits);

      clearInterval(timerId);
    }
  }, 100)

  
});
