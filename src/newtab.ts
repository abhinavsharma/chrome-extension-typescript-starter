import { renderHistory, IHistoryItem } from 'lumos-history';

const minimumHistorySize = 50;
const limitDaysBack = 7;
const microsecondsBack = 1000 * 60 * 60 * 24;

const fetchVisits = (historyItem: chrome.history.HistoryItem) => {
  return new Promise((resolve) => {
    chrome.history.getVisits({url: historyItem.url}, (visits: chrome.history.VisitItem[]) => {
      let realVisits = visits.filter((visit) => visit.id === historyItem.id);
      
      if (!realVisits.length) {
        return resolve();
      }

      const customVisits = realVisits.map((visit) => {
        let customVisit: IHistoryItem = {
          historyId: visit.id,
          visitId: visit.visitId,
          referringVisitId: visit.referringVisitId,
          transition: visit.transition,
          visitTime: visit.visitTime ?? 0,
          url: historyItem.url ?? '',
          title: historyItem.title ?? '',
        }
        
        return customVisit;
      });

      resolve(customVisits);
    });
  });
}

const fetchHistory = (startTime, endTime, callback) => {
  chrome.history.search(
    {
      'text': '', 
      maxResults: 0,
      startTime,
      endTime,
    },
    async (historyItems: chrome.history.HistoryItem[]) => {
      if (!historyItems.length) {
        return callback([]);
      }

      const promises = historyItems
        .filter(historyItem => historyItem.url)
        .map(fetchVisits);

      const visits = await Promise.all(promises);
      callback([].concat(...visits)); // flattenning
    }
  );
};

window.addEventListener('DOMContentLoaded', () => {
  let allVisits : IHistoryItem[] = [];
  let isFetching = false;
  let canFetchMore = true;
  let daysBack = 0;
  let endTime = Date.now();
  let startTime;

  const historyContainer = document.createElement('div');
  document.body.append(historyContainer);

  const fetchAndRender = () => {
    if (!canFetchMore || isFetching) {
      return;
    }

    const now = Date.now();

    daysBack += 1;
    startTime = now - microsecondsBack * daysBack;
    endTime = startTime + microsecondsBack;

    isFetching = true;
    fetchHistory(startTime, endTime, (newVisits) => {
      isFetching = false;

      if (daysBack > limitDaysBack) {
        canFetchMore = false;
        return;
      }

      allVisits.push(...newVisits);

      const visits = allVisits
      .sort((a: IHistoryItem,b: IHistoryItem) => b.visitTime - a.visitTime)
      .filter((i,idx) => idx > 0 && allVisits[idx-1].url !== i.url);

      renderHistory(historyContainer, visits);

      if (newVisits.length === 0 || allVisits.length < minimumHistorySize) {
        fetchAndRender();
        return;
      }
    });
  };

  window.addEventListener('scroll', function(e) {
    const bottomDistance = document.body.scrollHeight - window.innerHeight - window.scrollY;
  
    if (bottomDistance < bottomDistanceToLoad) {
      fetchAndRender();
    }
  });

  fetchAndRender();
});
