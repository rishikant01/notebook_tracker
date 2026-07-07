let notebookPieChart, projectPieChart, classBarChart, sectionBarChart;

document.addEventListener("DOMContentLoaded", loadDashboard);

async function loadDashboard() {
  try {
    const data = await fetchJSON("/summary");
    renderOverall(data.overall);
    renderClassSummary(data.class_summary);
    renderSectionSummary(data.section_summary);
    renderCharts(data.overall, data.class_summary, data.section_summary);
  } catch (e) {
    showToast("Could not load dashboard data. Import a workbook first.", "error");
  }
}

function renderOverall(overall) {
  document.getElementById("dTotal").textContent = overall.total_students;
  document.getElementById("dNbDone").textContent = overall.notebook_submitted;
  document.getElementById("dNbPending").textContent = overall.notebook_pending;
  document.getElementById("dPrDone").textContent = overall.project_submitted;
  document.getElementById("dPrPending").textContent = overall.project_pending;
}

function renderClassSummary(rows) {
  const body = document.getElementById("classSummaryBody");
  body.innerHTML = rows.map(r => `
    <tr><td>${r.class_name}</td><td>${r.students}</td><td>${r.notebook_pct}%</td><td>${r.project_pct}%</td></tr>
  `).join("") || `<tr><td colspan="4" class="text-muted text-center">No data</td></tr>`;
}

function renderSectionSummary(rows) {
  const body = document.getElementById("sectionSummaryBody");
  body.innerHTML = rows.map(r => `
    <tr><td>${r.class_name}</td><td>${r.section}</td><td>${r.students}</td>
      <td>${r.notebook_done}</td><td>${r.project_done}</td><td>${r.pending}</td></tr>
  `).join("") || `<tr><td colspan="6" class="text-muted text-center">No data</td></tr>`;
}

function renderCharts(overall, classSummary, sectionSummary) {
  const ctxNb = document.getElementById("notebookPie");
  const ctxPr = document.getElementById("projectPie");
  const ctxClass = document.getElementById("classBar");
  const ctxSection = document.getElementById("sectionBar");

  if (notebookPieChart) notebookPieChart.destroy();
  if (projectPieChart) projectPieChart.destroy();
  if (classBarChart) classBarChart.destroy();
  if (sectionBarChart) sectionBarChart.destroy();

  notebookPieChart = new Chart(ctxNb, {
    type: "pie",
    data: {
      labels: ["Submitted", "Pending"],
      datasets: [{ data: [overall.notebook_submitted, overall.notebook_pending], backgroundColor: ["#2e7d32", "#c62828"] }],
    },
  });

  projectPieChart = new Chart(ctxPr, {
    type: "pie",
    data: {
      labels: ["Submitted", "Pending"],
      datasets: [{ data: [overall.project_submitted, overall.project_pending], backgroundColor: ["#1565C0", "#f9a825"] }],
    },
  });

  classBarChart = new Chart(ctxClass, {
    type: "bar",
    data: {
      labels: classSummary.map(c => c.class_name),
      datasets: [
        { label: "Notebook %", data: classSummary.map(c => c.notebook_pct), backgroundColor: "#1565C0" },
        { label: "Project %", data: classSummary.map(c => c.project_pct), backgroundColor: "#42a5f5" },
      ],
    },
    options: { scales: { y: { beginAtZero: true, max: 100 } } },
  });

  sectionBarChart = new Chart(ctxSection, {
    type: "bar",
    data: {
      labels: sectionSummary.map(s => `${s.class_name} - ${s.section}`),
      datasets: [
        { label: "Notebook Done", data: sectionSummary.map(s => s.notebook_done), backgroundColor: "#2e7d32" },
        { label: "Project Done", data: sectionSummary.map(s => s.project_done), backgroundColor: "#1565C0" },
        { label: "Students", data: sectionSummary.map(s => s.students), backgroundColor: "#cfd8dc" },
      ],
    },
    options: { scales: { y: { beginAtZero: true } } },
  });
}
