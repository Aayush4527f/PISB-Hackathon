  document.addEventListener("DOMContentLoaded", () => {
    const logout_btn = document.getElementById("logout");

    logout_btn.addEventListener("click", async (e) => {
      e.preventDefault();
      document.cookie = "token" + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=" + "/" + ";";
      window.location.replace("/login");
    });
  });
  
  let records = [];

  async function get_scans() {
    try {
      const res = await fetch("/api/scan/dashboard", {
        method: "POST",
        body: JSON.stringify({}),
      });

      const data = await res.json();

      if (data.success) {
        records = data.scans;
        renderTable(records);
      } else {
        alert(data.message || "Failed to load scans.");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong. Please try again.");
    }
  }
  
  // Initial load of the scans
  get_scans();

  const tbody = document.querySelector(".data-table tbody");
  const searchInput = document.querySelector(".search-filter input");

  function renderTable(data) {
    tbody.innerHTML = "";
    data.forEach((item) => {
      const row = document.createElement("tr");
      const pneumoniaStatus = item.is_pneumonia;
      const tagClass = pneumoniaStatus ? 'not-analyzed' : 'analyzed';
      const tagText = pneumoniaStatus ? 'Yes' : 'No';

      row.innerHTML = `
        <td>${item.createdAt}</td>
        <td>${item.patient_id}</td>
        <td><button class="view-btn" onclick="showNote('${item.note}')">View</button></td>
        <td><a href="${item.url}" target="_blank" class="image-link">View Image</a></td>
        <td><span class="tag ${tagClass}">${tagText}</span></td>
        <td><button class="view-btn" onclick="showSummary('${item.summary}')">View</button></td>
        <td><button class="delete-btn" onclick="deleteScan('${item.patient_id}')">Delete</button></td> 
      `;
      tbody.appendChild(row);
    });
  }
  
  async function deleteScan(patientId) {
    // A custom modal for confirmation would be better than confirm()
    if (!confirm(`Are you sure you want to delete the scan for Patient ID: ${patientId}?`)) {
        return;
    }

    try {
        const res = await fetch('/api/scan/delete', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ patient_id: patientId }),
        });

        const data = await res.json();

        if (data.success) {
            alert('Scan deleted successfully.');
            window.location.reload();
        } else {
            alert(data.message || 'Failed to delete the scan.');
        }
    } catch (err) {
        console.error('Delete error:', err);
        alert('An error occurred while trying to delete the scan.');
    }
  }

  searchInput.addEventListener("input", () => {
    const keyword = searchInput.value.toLowerCase();
    const filtered = records.filter((item) =>
      item.patient_id.toLowerCase().includes(keyword) || item.createdAt.toLowerCase().includes(keyword)
    );
    renderTable(filtered);
  });

  // Modal functionality
  const summaryModal = document.getElementById("summaryModal");
  const summaryText = document.getElementById("summaryText");
  const noteModal = document.getElementById("noteModal");
  const noteText = document.getElementById("noteText");
  const closeBtns = document.querySelectorAll(".close");

  function showSummary(summary) {
    summaryText.textContent = summary || "No summary available.";
    summaryModal.style.display = "flex";
  }

  function showNote(note) {
    noteText.textContent = note || "No note available.";
    noteModal.style.display = "flex";
  }

  function closeModal() {
      summaryModal.style.display = "none";
      noteModal.style.display = "none";
  }

  closeBtns.forEach(btn => {
    btn.onclick = closeModal;
  });

  window.onclick = function(event) {
    if (event.target == summaryModal || event.target == noteModal) {
      closeModal();
    }
  }
