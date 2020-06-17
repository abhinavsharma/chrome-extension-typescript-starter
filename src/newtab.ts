console.log("Hello")
let text = "Hello World"

interface HistoryItem {
  id: string,
  url?: string,
  title?: string,
  lastVisitTime?: number,
  visitCount?: number,
  typedCount?: number
}

const days = 7;
const microsecondsBack = 1000 * 60 * 60 * 24 * days;
const startTime = (new Date).getTime() - microsecondsBack;

window.addEventListener('DOMContentLoaded', (event) => {
  chrome.history.search({
    'text': '', 
    maxResults: 0, 
    startTime: startTime}, (historyItems: HistoryItem[]) => {
    debugger;
  })
});

