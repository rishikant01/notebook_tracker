let currentFilter = "all";

document.addEventListener("DOMContentLoaded", () => {
  const classSelect = document.getElementById("classSelect");
  const sectionSelect = document.getElementById("sectionSelect");

  populateClassDropdown(classSelect, sectionSelect, () => {
    if (classSelect.value && sectionSelect.value) loadStudents();
  });

  // Preselect from URL params (?class=VI&section=Ravi)
  const params = new URLSearchParams(window.location.search);
  const presetClass = params.get("class");
  const presetSection = params.get("section");

  if (presetClass) {
    const trySet = setInterval(() => {
      if ([...classSelect.options].some(o => o.value === presetClass)) {
        classSelect.value = presetClass;
        classSelect.dispatchEvent(new Event("change"));
        clearInterval(trySet);
        const trySection = setInterval(() => {
          if (presetSection && [...sectionSelect.options].some(o => o.value === presetSection)) {
            sectionSelect.value = presetSection;
            loadStudents();
            clearInterval(trySection);
          }
        }, 100);
      }
    }, 100);
  }

  document.getElementById("searchName").addEventListener("input", debounce(loadStudents, 350));
  document.getElementById("searchRoll").addEventListener("input", debounce(loadStudents, 350));
});

function debounce(fn, delay) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), delay); };
}

function setFilter(filter) {
  currentFilter = filter;
  document.querySelectorAll(".filter-btn").forEach(b => b.classList.toggle("active", b.dataset.filter === filter));
  loadStudents();
}

function getSelection() {
  return {
    class_name: document.getElementById("classSelect").value,
    section: document.getElementById("sectionSelect").value,
  };
}

async function loadStudents() {
  const { class_name, section } = getSelection();
  const body = document.getElementById("studentsBody");
  if (!class_name || !section) {
    body.innerHTML = `<tr><td colspan="5" class="text-center text-muted py-5">Select a class and section to view students.</td></tr>`;
    document.getElementById("summaryCards").classList.add("d-none");
    document.getElementById("bulkActions").classList.add("d-none");
    return;
  }

  const search = document.getElementById("searchName").value.trim();
  const rollSearch = document.getElementById("searchRoll").value.trim();

  const url = `/students?class_name=${encodeURIComponent(class_name)}&section=${encodeURIComponent(section)}` +
    `&search=${encodeURIComponent(search)}&roll_search=${encodeURIComponent(rollSearch)}&filter=${currentFilter}`;

  try {
    const data = await fetchJSON(url);
    renderStudents(data.students);
    renderSummary(data.summary);
    document.getElementById("summaryCards").classList.remove("d-none");
    document.getElementById("bulkActions").classList.remove("d-none");
    document.getElementById("exportCsvBtn").href = `/export/csv?class_name=${encodeURIComponent(class_name)}&section=${encodeURIComponent(section)}`;
    document.getElementById("exportPdfBtn").href = `/export/pdf?scope=section&class_name=${encodeURIComponent(class_name)}&section=${encodeURIComponent(section)}`;
  } catch (e) {
    showToast(e.message, "error");
  }
}

function renderStudents(students) {
  const body = document.getElementById("studentsBody");
  if (!students.length) {
    body.innerHTML = `<tr><td colspan="5" class="text-center text-muted py-5">No students match this filter.</td></tr>`;
    return;
  }
  body.innerHTML = students.map(s => {
    const statusClass = s.notebook && s.project ? "status-green" : (s.notebook || s.project) ? "status-yellow" : "status-red";
    return `
      <tr data-id="${s.id}">
        <td>${s.roll_no}</td>
        <td>${escapeHtml(s.name)}</td>
        <td class="text-center">
          <input type="checkbox" class="form-check-input" ${s.notebook ? "checked" : ""}
            onchange="updateStatus(${s.id}, 'notebook', this.checked, this)">
        </td>
        <td class="text-center">
          <input type="checkbox" class="form-check-input" ${s.project ? "checked" : ""}
            onchange="updateStatus(${s.id}, 'project', this.checked, this)">
        </td>
        <td class="text-center"><span class="status-dot ${statusClass}"></span></td>
      </tr>`;
  }).join("");
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

async function updateStatus(id, field, value, checkboxEl) {
  const row = checkboxEl.closest("tr");
  try {
    const resp = await fetchJSON("/update_status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, field, value }),
    });
    const s = resp.student;
    const dot = row.querySelector(".status-dot");
    dot.className = "status-dot " + (s.notebook && s.project ? "status-green" : (s.notebook || s.project) ? "status-yellow" : "status-red");
    showToast("Saved", "success");
    refreshSummaryOnly();
  } catch (e) {
    checkboxEl.checked = !value;
    showToast(e.message, "error");
  }
}

async function refreshSummaryOnly() {
  const { class_name, section } = getSelection();
  if (!class_name || !section) return;
  try {
    const data = await fetchJSON(`/students?class_name=${encodeURIComponent(class_name)}&section=${encodeURIComponent(section)}&filter=all`);
    renderSummary(data.summary);
  } catch (e) { /* silent */ }
}

function renderSummary(summary) {
  document.getElementById("sumTotal").textContent = summary.total;
  document.getElementById("sumNbDone").textContent = summary.notebook_submitted;
  document.getElementById("sumNbPending").textContent = summary.notebook_pending;
  document.getElementById("sumPrDone").textContent = summary.project_submitted;
  document.getElementById("sumPrPending").textContent = summary.project_pending;
  document.getElementById("sumNbPct").textContent = summary.notebook_pct + "%";
  document.getElementById("sumPrPct").textContent = summary.project_pct + "%";
  document.getElementById("nbProgressBar").style.width = summary.notebook_pct + "%";
  document.getElementById("prProgressBar").style.width = summary.project_pct + "%";
}

async function bulkAction(action) {
  const { class_name, section } = getSelection();
  if (!class_name || !section) return;
  try {
    await fetchJSON("/bulk_action", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, class_name, section }),
    });
    showToast("Bulk action applied", "success");
    loadStudents();
  } catch (e) {
    showToast(e.message, "error");
  }
}

function confirmReset() {
  if (confirm("This will clear all notebook and project statuses for this section. Continue?")) {
    bulkAction("reset_section");
  }
}
