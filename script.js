(function(){
  const $ = (s) => document.querySelector(s);
  const form = $('#trackerForm');
  const summary = $('#summary');
  const result = $('#result');
  const monthsEl = $('#multiMonths');
  const resetBtn = $('#resetBtn');
  const themeToggle = $('#themeToggle');
  const calendarSection = $('#calendarSection');
  const calendarEl = $('#calendar');

  // Theme toggle
  const THEME_KEY = 'pookie_theme';
  if(localStorage.getItem(THEME_KEY)){
    document.documentElement.setAttribute('data-theme', localStorage.getItem(THEME_KEY));
  }
  themeToggle.addEventListener('click',()=>{
    const next = document.documentElement.getAttribute('data-theme')==='light'?'dark':'light';
    document.documentElement.setAttribute('data-theme',next);
    localStorage.setItem(THEME_KEY,next);
  });

  // Reset
  resetBtn.addEventListener('click',()=>{
    localStorage.clear(); form.reset(); result.hidden=true; calendarSection.hidden=true;
  });

  // Helpers
  const addDays=(d,n)=>{let nd=new Date(d); nd.setDate(nd.getDate()+n); return nd;}
  const format=(d)=>d.toLocaleDateString(undefined,{month:'short',day:'numeric'});
  
  function computePrediction(start,cycle,period){
    const nextPeriod = addDays(start,cycle);
    const ovulation = addDays(nextPeriod,-14);
    const fertileStart = addDays(ovulation,-5);
    const fertileEnd = ovulation;
    return {nextPeriod,ovulation,fertileStart,fertileEnd,periodEnd:addDays(start,period-1)};
  }

  function render(pred,notes){
    summary.innerHTML = `
      <div class="item">🩸 Next period: <b>${format(pred.nextPeriod)}</b></div>
      <div class="item">📆 Current period: ${format(new Date($('#startDate').value))} – ${format(pred.periodEnd)}</div>
      <div class="item">🌱 Fertile: ${format(pred.fertileStart)} – ${format(pred.fertileEnd)}</div>
      <div class="item">💡 Ovulation: ${format(pred.ovulation)}</div>
      ${notes?`<div class="item">📝 ${notes}</div>`:''}
    `;
  }

  function renderMonths(start,cycle,period){
    monthsEl.innerHTML="";
    let anchor=new Date(start);
    for(let i=1;i<=6;i++){
      const next=addDays(anchor,cycle);
      const pred=computePrediction(next,cycle,period);
      monthsEl.innerHTML+=`
        <div class="month animate-up">
          <h4>${next.toLocaleDateString(undefined,{month:'long',year:'numeric'})}</h4>
          <div>🩸 ${format(next)} – ${format(addDays(next,period-1))}</div>
          <div>💡 Ovulation: ${format(pred.ovulation)}</div>
          <div>🌱 ${format(pred.fertileStart)} – ${format(pred.fertileEnd)}</div>
        </div>`;
      anchor=next;
    }
  }

  function renderCalendar(startDate, cycleLen, periodLen) {
    calendarEl.innerHTML = "";
    calendarSection.hidden = false;

    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const pred = computePrediction(startDate, cycleLen, periodLen);

    // Period days
    const periodDays = [];
    for (let i = 0; i < periodLen; i++) {
      periodDays.push(addDays(startDate, i).toDateString());
    }

    // Fertile window
    const fertileDays = [];
    let d = new Date(pred.fertileStart);
    while (d <= pred.fertileEnd) {
      fertileDays.push(d.toDateString());
      d.setDate(d.getDate() + 1);
    }
    const ovulationDay = pred.ovulation.toDateString();

    // Empty slots before 1st
    for (let i = 0; i < firstDay.getDay(); i++) {
      calendarEl.innerHTML += `<div></div>`;
    }

    // All days
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const current = new Date(year, month, day);
      let classes = "day";
      if (current.toDateString() === new Date().toDateString()) classes += " today";
      if (periodDays.includes(current.toDateString())) classes += " period";
      if (fertileDays.includes(current.toDateString())) classes += " fertile";
      if (current.toDateString() === ovulationDay) classes += " ovulation";

      calendarEl.innerHTML += `<div class="${classes}">${day}</div>`;
    }
  }

  form.addEventListener('submit',e=>{
    e.preventDefault();
    const start=new Date($('#startDate').value);
    const cycle=parseInt($('#cycleLength').value,10);
    const period=parseInt($('#periodLength').value,10);
    const notes=$('#notes').value.trim();
    if(!start||isNaN(start)) return alert("Select valid date");
    const pred=computePrediction(start,cycle,period);
    render(pred,notes);
    renderMonths(start,cycle,period);
    renderCalendar(start,cycle,period);
    result.hidden=false;
  });
})();
// Register Service Worker for PWA
if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("sw.js")
    .then(() => console.log("Service Worker Registered ✅"));
}