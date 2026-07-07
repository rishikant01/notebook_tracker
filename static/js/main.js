// Shared utilities used across pages

function showToast(message, type = "success") {
  const icons = {
    success: "fa-circle-check text-success",
    error: "fa-circle-exclamation text-danger",
    info: "fa-circle-info text-primary",
  };
  const el = document.createElement("div");
  el.className = "toast align-items-center border-0 show mb-2";
  el.innerHTML = `
    <div class="d-flex">
      <div class="toast-body">
        <i class="fa-solid ${icons[type] || icons.info} me-2"></i>${message}
      </div>
      <button type="button" class="btn-close me-2 m-auto" onclick="this.closest('.toast').remove()"></button>
    </div>`;
  document.getElementById("toastContainer").appendChild(el);
  setTimeout(() => el.remove(), 4000);
}

async function fetchJSON(url, options = {}) {
  const resp = await fetch(url, options);
  let data;
  try {
    data = await resp.json();
  } catch (e) {
    data = null;
  }
  if (!resp.ok) {
    const msg = (data && data.message) || `Request failed (${resp.status})`;
    throw new Error(msg);
  }
  return data;
}

// Populate class dropdown, wire up section dependency. Returns a promise.
async function populateClassDropdown(classSelectEl, sectionSelectEl, onReady) {
  try {
    const classes = await fetchJSON("/api/classes");
    classSelectEl.innerHTML = '<option value="">Select Class</option>' +
      classes.map(c => `<option value="${c}">${c}</option>`).join("");
  } catch (e) {
    showToast("Could not load classes. Import a workbook first.", "error");
  }

  classSelectEl.addEventListener("change", async () => {
    const cls = classSelectEl.value;
    sectionSelectEl.innerHTML = '<option value="">Select Section</option>';
    sectionSelectEl.disabled = true;
    if (!cls) return;
    try {
      const sections = await fetchJSON(`/api/sections?class_name=${encodeURIComponent(cls)}`);
      sectionSelectEl.innerHTML = '<option value="">Select Section</option>' +
        sections.map(s => `<option value="${s}">${s}</option>`).join("");
      sectionSelectEl.disabled = false;
    } catch (e) {
      showToast("Could not load sections.", "error");
    }
    if (onReady) onReady();
  });

  sectionSelectEl.addEventListener("change", () => { if (onReady) onReady(); });
}
