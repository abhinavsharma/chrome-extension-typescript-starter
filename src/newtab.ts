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

window.addEventListener('DOMContentLoaded', (event) => {
  chrome.history.search({'text': ''}, (historyItems: HistoryItem[]) => {
    debugger;
  })
});

console.log(document.querySelector("body"))