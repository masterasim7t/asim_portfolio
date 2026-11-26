(() => {
  // Project summaries use only placeholder sample content.
  const caseStudies = {
    featured: { eyebrow: 'FREELANCE SOCIAL MEDIA CAMPAIGN', title: 'Bloom Café', text: 'A sample campaign for a neighbourhood café. It covered a four-week content calendar, simple creatives, a consistent brand voice and weekly reports on reach and engagement. Replace this text with your own case study.', tools: 'Social media · Content plan · Reporting · Brand voice' },
    budget: { eyebrow: 'FINTECH / WEB PROJECT', title: 'Budget Tracker', text: 'A spreadsheet-driven tracker that groups monthly spending into categories and shows progress toward savings goals with a clean summary view.', tools: 'Spreadsheets · Budgeting · Dashboards' },
    churn: { eyebrow: 'DATA / ANALYTICS PROJECT', title: 'Customer Churn Insights', text: 'A sample analysis exploring why customers stop buying. It segments customers, compares behaviour and proposes a few retention ideas.', tools: 'Analysis · Segmentation · Charts' },
    splitter: { eyebrow: 'FRONT-END PROJECT', title: 'Expense Splitter', text: 'A small web tool concept for splitting shared bills among friends, with a clear list of who owes whom.', tools: 'HTML · CSS · JavaScript' },
    funnel: { eyebrow: 'MARKETING / ANALYTICS PROJECT', title: 'Lead Funnel Dashboard', text: 'A sample dashboard that follows leads from first click to paying customer and highlights the stages where people drop off.', tools: 'Dashboards · CRM data' },
    newsletter: { eyebrow: 'CONTENT PROJECT', title: 'Newsletter Hub', text: 'A content project for planning, writing and organising a weekly newsletter, including topic ideas and a simple publishing schedule.', tools: 'Content · Email' },
    reminders: { eyebrow: 'AUTOMATION PROJECT', title: 'Invoice Reminder Bot', text: 'A small no-code automation that sends polite payment reminders on a schedule so invoices do not need to be chased manually.', tools: 'No-code · Automation' }
  };
  const dialog = document.getElementById('caseDialog');
  document.querySelectorAll('.case-study-trigger').forEach(button => button.addEventListener('click', () => {
    const item = caseStudies[button.dataset.case];
    document.getElementById('dialogEyebrow').textContent = item.eyebrow;
    document.getElementById('dialogTitle').textContent = item.title;
    document.getElementById('dialogText').textContent = item.text;
    document.getElementById('dialogTools').textContent = item.tools;
    const link = document.getElementById('dialogLink');
    if (item.link) { link.href = item.link; link.hidden = false; } else { link.hidden = true; }
    dialog.showModal();
  }));
  document.getElementById('dialogClose').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', e => { if (e.target === dialog) dialog.close(); });

})();
