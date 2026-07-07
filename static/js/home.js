document.addEventListener("DOMContentLoaded", () => {
  const classSelect = document.getElementById("classSelect");
  const sectionSelect = document.getElementById("sectionSelect");
  const loadBtn = document.getElementById("loadStudentsBtn");

  populateClassDropdown(classSelect, sectionSelect, () => {
    loadBtn.disabled = !(classSelect.value && sectionSelect.value);
  });

  loadSummary();
  wireSettingsModal();

  document.getElementById("doImportBtn").addEventListener("click", async () => {
    const fileInput = document.getElementById("excelFile");
    const replace = document.getElementById("replaceCheck").checked;
    const progress = document.getElementById("importProgress");
    const resultDiv = document.getElementById("importResult");
    resultDiv.innerHTML = "";

    if (!fileInput.files.length) {
      showToast("Please choose an Excel file first.", "error");
      return;
    }

    progress.classList.remove("d-none");
    try {
      const formData = new FormData();
      formData.append("file", fileInput.files[0]);
      await fetchJSON("/upload", { method: "POST", body: formData });

      const importResp = await fetchJSON(`/import?replace=${replace}`, { method: "POST" });
      resultDiv.innerHTML = `<div class="alert alert-success mt-2 mb-0"><i class="fa-solid fa-circle-check me-2"></i>${importResp.message}</div>`;
      showToast(importResp.message, "success");
      loadSummary();
      populateClassDropdown(classSelect, sectionSelect, () => {
        loadBtn.disabled = !(classSelect.value && sectionSelect.value);
      });
    } catch (e) {
      resultDiv.innerHTML = `<div class="alert alert-danger mt-2 mb-0"><i class="fa-solid fa-circle-exclamation me-2"></i>${e.message}</div>`;
      showToast(e.message, "error");
    } finally {
      progress.classList.add("d-none");
    }
  });
});

async function loadSummary() {
  try {
    const data = await fetchJSON("/summary");
    document.getElementById("schoolName").textContent = data.school_name;
    document.getElementById("academicSession").textContent = data.academic_session;
    document.getElementById("lastImport").textContent = data.last_import_date;
    document.getElementById("totalStudents").textContent = data.overall.total_students;
    document.getElementById("notebookDone").textContent = data.overall.notebook_submitted;
    document.getElementById("projectDone").textContent = data.overall.project_submitted;
    document.getElementById("totalPending").textContent =
      data.overall.notebook_pending + data.overall.project_pending;
  } catch (e) {
    showToast("Could not load dashboard summary.", "error");
  }
}

function goToStudents() {
  const cls = document.getElementById("classSelect").value;
  const section = document.getElementById("sectionSelect").value;
  if (!cls || !section) return;
  window.location.href = `/students-page?class=${encodeURIComponent(cls)}&section=${encodeURIComponent(section)}`;
}

function wireSettingsModal() {
  const modal = document.getElementById("settingsModal");
  const nameInput = document.getElementById("settingsSchoolName");
  const sessionInput = document.getElementById("settingsSession");
  const resultDiv = document.getElementById("settingsResult");

  modal.addEventListener("show.bs.modal", async () => {
    resultDiv.innerHTML = "";
    try {
      const data = await fetchJSON("/api/settings");
      nameInput.value = data.school_name;
      sessionInput.value = data.academic_session;
    } catch (e) {
      showToast("Could not load current settings.", "error");
    }
  });

  document.getElementById("saveSettingsBtn").addEventListener("click", async () => {
    try {
      const data = await fetchJSON("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          school_name: nameInput.value,
          academic_session: sessionInput.value,
        }),
      });
      resultDiv.innerHTML = `<div class="alert alert-success mt-2 mb-0 py-2">Saved.</div>`;
      showToast("Settings saved", "success");
      loadSummary();
    } catch (e) {
      resultDiv.innerHTML = `<div class="alert alert-danger mt-2 mb-0 py-2">${e.message}</div>`;
      showToast(e.message, "error");
    }
  });
}
