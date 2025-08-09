    document.addEventListener("DOMContentLoaded", () => {
      const uploadForm = document.getElementById("uploadForm");
      const fileInput = document.getElementById("fileInput");
      const uploadArea = document.getElementById("uploadArea");
      const patientInfoForm = document.querySelector(".patient-info-form");
      const logout_btn = document.getElementById("logout");
      const submit_btn = document.getElementById("submit_btn");
      const scan_another_btn = document.getElementById("scan_another_btn");
      const results_section = document.getElementById("results_section");
      const results_title = document.getElementById("results_title");
      const results_content = document.getElementById("results_content");

      function displayPreview(file) {
        if (file) {
          const reader = new FileReader();
          reader.onload = (e) => {
            uploadArea.innerHTML = `<img src="${e.target.result}" alt="X-ray preview"/>`;
          };
          reader.readAsDataURL(file);
        }
      }

      /**
       * Formats raw text from the analysis summary into HTML.
       * Replaces newline characters with <br> and **bold** syntax with <strong> tags.
       * @param {string} text - The raw text to format.
       * @returns {string} - The formatted HTML string.
       */
      function formatGeminiOutput(text) {
        if (!text) return 'N/A';
        // Replace **text** with <strong>text</strong> for bolding
        let formattedText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        // Replace newline characters with <br> tags
        formattedText = formattedText.replace(/\n/g, '<br>');
        return formattedText;
      }

      uploadArea.addEventListener("click", () => fileInput.click());
      fileInput.addEventListener("change", () => {
        if (fileInput.files.length > 0) {
            displayPreview(fileInput.files[0]);
        }
      });

      uploadArea.addEventListener("dragover", (e) => {
        e.preventDefault();
        uploadArea.style.backgroundColor = "#e0efff";
        uploadArea.style.borderColor = "#0056b3";
      });

      uploadArea.addEventListener("dragleave", () => {
        uploadArea.style.backgroundColor = "#f0f8ff";
        uploadArea.style.borderColor = "#007bff";
      });

      uploadArea.addEventListener("drop", (e) => {
        e.preventDefault();
        uploadArea.style.backgroundColor = "#f0f8ff";
        uploadArea.style.borderColor = "#007bff";
        if (e.dataTransfer.files.length > 0) {
            fileInput.files = e.dataTransfer.files;
            displayPreview(fileInput.files[0]);
        }
      });

      uploadForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const file = fileInput.files[0];
        const patientId = document.getElementById("patient_id").value;
        const note = document.getElementById("note").value;

        if (!file) {
          alert("Please select an image file to upload.");
          return;
        }
        if (!patientId.trim()) {
          alert("Patient ID is a mandatory field.");
          return;
        }

        try {
          submit_btn.textContent = "Analyzing...";
          submit_btn.disabled = true;

          const formData = new FormData();
          formData.append("scanImage", file);
          formData.append("patient_id", patientId);
          formData.append("note", note);

          const res = await fetch("/api/scan/", {
            method: "POST",
            body: formData,
          });

          const data = await res.json();
          
          // Hide form elements and show results section
          uploadArea.style.display = "none";
          patientInfoForm.style.display = "none";
          submit_btn.style.display = "none";
          scan_another_btn.style.display = "inline-block";
          results_section.style.display = "block";

          if (data.success) {
            results_title.textContent = "Analysis Complete";
            results_section.style.border = "2px solid #4CAF50";
            results_section.style.backgroundColor = "#f0fff0";
            // Format the summary from the response
            const formattedSummary = formatGeminiOutput(data.summary);
            results_content.innerHTML = `
            <p><strong>Diagnosis:</strong> ${data.diagnosis ? 'Pneumonia Detected' : 'No Pneumonia Detected'}</p>
            <p><strong>Summary:</strong> ${formattedSummary}</p>
            `;
          } else {
            results_title.textContent = "Analysis Failed";
            results_section.style.border = "2px solid #f44336";
            results_section.style.backgroundColor = "#fff9f9";
            results_content.innerHTML = `<p>${data.message || 'An unknown error occurred.'}</p>`;
          }
        } catch (err) {
          console.error("Upload error:", err);
          // Hide form elements even if an error occurs
          uploadArea.style.display = "none";
          patientInfoForm.style.display = "none";
          submit_btn.style.display = "none";
          scan_another_btn.style.display = "inline-block";
          results_section.style.display = "block";
          results_title.textContent = "Error";
          results_section.style.border = "2px solid #f44336";
          results_section.style.backgroundColor = "#fff9f9";
          results_content.innerHTML = `<p>A network or server error occurred. Please try again.</p>`;
        }
      });

      scan_another_btn.addEventListener("click", () => {
        window.location.reload();
      });

      logout_btn.addEventListener("click", (e) => {
        e.preventDefault();
        document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        window.location.replace("/login.html");
      });
    });