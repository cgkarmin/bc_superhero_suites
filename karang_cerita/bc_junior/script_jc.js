// karang_cerita/bc_junior/script_jc.js - 12 Mei 2025, 10:24 AM +08
// promptTeks dalam adunDanSalinPromptAI dikemaskini untuk karangan ~260 perkataan

const rowsConfig = [
  { label: "Mula Cerita", title: "Bahagian permulaan cerita – Siapa & di mana?" },
  { label: "Masalah", title: "Apa konflik, cabaran atau kejadian utama?" },
  { label: "Penyelesaian", title: "Tindakan atau keputusan yang menyelesaikan masalah" },
  { label: "Akhir Cerita", title: "Kesudahan cerita – bagaimana ia tamat?" }
];

const colsConfig = [
  { label: "Orang & Tempat", key: "orang_tempat" },
  { label: "Peristiwa", key: "peristiwa" },
  { label: "Perasaan", key: "perasaan" },
  { label: "Dialog Ringkas", key: "dialog_ringkas" }
];

function populateTableHeader() {
    const thead = document.querySelector("#bcTable thead tr");
    if (!thead) {
        console.error("Elemen thead tr tidak ditemui untuk #bcTable");
        showAlert("Ralat: Header jadual tidak dapat dijana.", "danger");
        return;
    }
    thead.innerHTML = ""; 

    const thPlot = document.createElement("th");
    thPlot.textContent = "🧠 Plot Cerita"; 
    thPlot.title = "Ini papan cerita dengan empat baris utama.";
    thead.appendChild(thPlot);

    colsConfig.forEach(col => {
        const th = document.createElement("th");
        th.textContent = col.label;
        th.title = `Elemen cerita: ${col.label}`; 
        thead.appendChild(th);
    });
}

function populateTable() {
  const tbody = document.getElementById("bcBody");
  if (!tbody) {
      console.error("Elemen tbody dengan ID 'bcBody' tidak ditemui!");
      showAlert("Ralat: Badan jadual tidak dapat dijana.", "danger");
      return;
  }
  tbody.innerHTML = ""; 

  rowsConfig.forEach((rowConf, rowIndex) => { 
    const tr = document.createElement("tr");
    const th = document.createElement("th"); 
    th.textContent = rowConf.label;
    th.title = rowConf.title;
    tr.appendChild(th);

    colsConfig.forEach((colConf, colIndex) => { 
      const td = document.createElement("td");
      const textarea = document.createElement("textarea");
      textarea.classList.add('form-control', 'pop-art-textarea-table'); 
      textarea.setAttribute('aria-label', `${rowConf.label} - ${colConf.label}`);
      td.appendChild(textarea);
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
}

function getTableData() {
    const data = [];
    const tbody = document.getElementById("bcBody");
    if (!tbody) {
        showAlert("Jadual tidak ditemui untuk mengambil data.", "danger");
        return data; 
    }

    if (!tbody.rows || tbody.rows.length === 0) {
        return data; 
    }

    [...tbody.rows].forEach((tr, rowIndex) => {
        const rowLabel = rowsConfig[rowIndex] ? rowsConfig[rowIndex].label : `Baris ${rowIndex + 1}`;
        const inputs = [...tr.querySelectorAll("td textarea")].map(input => input.value.trim());
        
        const rowDataObject = { plot_label: rowLabel };
        colsConfig.forEach((col, colIndex) => {
            rowDataObject[col.key] = inputs[colIndex] || "";
        });
        data.push(rowDataObject);
    });
    return data;
}

function exportData(format) { 
  if (!format) {
      showAlert("Format eksport tidak ditentukan.", "warning");
      return;
  }

  const tableData = getTableData(); 
  if(tableData.length === 0) {
      let isEmpty = true;
      const textareas = document.querySelectorAll("#bcBody textarea");
      if (textareas.length > 0) {
          isEmpty = [...textareas].every(ta => ta.value.trim() === "");
      }
      if (isEmpty) {
          showAlert("Tiada data dalam jadual untuk dieksport, atau semua medan kosong.", "warning");
          return;
      }
  }

  if (format === "csv") {
    exportCSV(tableData);
  } else if (format === "json") {
    const jsonStr = JSON.stringify(tableData, null, 2);
    downloadFile("draf_cerita_asas.json", jsonStr, "application/json");
  } else if (format === "xml") {
    exportXML(tableData); 
  } else {
      showAlert("Format eksport tidak sah dipilih.", "warning");
  }
}

function exportCSV(data) {
  let csvHeader = `"Plot Cerita",` + colsConfig.map(col => `"${col.label.replace(/"/g, '""')}"`).join(',') + "\n";
  let csvData = data.map(row => {
      let csvRow = `"${(row.plot_label || "").replace(/"/g, '""')}"`;
      colsConfig.forEach(col => {
          csvRow += `,"${(row[col.key] || "").replace(/"/g, '""')}"`;
      });
      return csvRow;
  }).join('\n');
  downloadFile("draf_cerita_asas.csv", csvHeader + csvData, "text/csv;charset=utf-8;");
}

function exportXML(data) { 
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<DrafCeritaAsas>\n';
  data.forEach(row => {
    xml += `  <Plot Tahap="${(row.plot_label || "Tidak_Diketahui").replace(/ /g, '_')}">\n`;
    colsConfig.forEach(col => {
      const tag = col.key.replace(/[^a-zA-Z0-9_]/g, ''); 
      const value = row[col.key] || "";
      xml += `    <${tag}><![CDATA[${value}]]></${tag}>\n`;
    });
    xml += "  </Plot>\n";
  });
  xml += "</DrafCeritaAsas>";
  downloadFile("draf_cerita_asas.xml", xml, "application/xml;charset=utf-8;");
}

function downloadFile(filename, content, type) {
  const blob = new Blob([content], { type });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link); 
  link.click();
  document.body.removeChild(link); 
  URL.revokeObjectURL(link.href); 
}

function importCSV() { 
  const fileInputElement = document.getElementById("fileInputCSV");
  if (fileInputElement) {
      fileInputElement.click();
  } else {
      showAlert("Elemen input fail CSV tidak ditemui.", "danger");
  }
}

function handleFile(eventOrFile) {
  const file = eventOrFile.target ? eventOrFile.target.files[0] : eventOrFile; 
  
  if (!file) {
      if (eventOrFile.target) eventOrFile.target.value = null; 
      return;
  }

  if (file.name.endsWith(".csv")) {
      processCSVFileContent(file); 
  } else {
      showAlert("Hanya fail .csv boleh dibuka atau diseret untuk mengisi jadual ini.", "warning");
  }
  if (eventOrFile.target) eventOrFile.target.value = null; 
}

function processCSVFileContent(file) {
    const reader = new FileReader();
    reader.onload = function (e) {
        try {
            const fileContent = e.target.result;
            const lines = fileContent.trim().split(/\r\n|\n|\r/); 
            const tbody = document.getElementById("bcBody");
            if (!tbody) throw new Error("Elemen tbody #bcBody tidak ditemui.");

            const headerLine = lines[0].toLowerCase();
            const dataLines = headerLine.includes("plot cerita") ? lines.slice(1) : lines;

            if(dataLines.length !== rowsConfig.length){
                showAlert(`Bilangan baris data dalam CSV (${dataLines.length}) tidak sepadan dengan bilangan baris jadual (${rowsConfig.length}). Sila semak format CSV.`, "warning");
                return;
            }

            const csvDataToLoad = [];
            dataLines.forEach((line, rowIndex) => {
                if (rowIndex < rowsConfig.length) { 
                    const parts = parseCSVLine(line); 
                    const rowDataObject = { plot_label: rowsConfig[rowIndex].label }; 
                    colsConfig.forEach((col, colIndex) => {
                        rowDataObject[col.key] = parts[colIndex + 1] || "";
                    });
                    csvDataToLoad.push(rowDataObject);
                }
            });
            loadDataToTable(csvDataToLoad); 
            showAlert("Data CSV berjaya dimuat naik ke jadual.", "success");

        } catch (error) {
            showAlert(`Ralat memproses fail CSV: ${error.message}`, "danger");
            console.error("Ralat CSV:", error);
        }
    };
    reader.readAsText(file);
}
    
function loadDataToTable(dataToLoad) {
    const tbody = document.getElementById("bcBody");
    if (!tbody || !tbody.rows) {
        showAlert("Tidak dapat memuatkan data: Jadual tidak ditemui atau tiada baris.", "danger");
        return;
    }

    dataToLoad.forEach((dataRow, rowIndex) => {
        if (rowIndex < tbody.rows.length) {
            const tr = tbody.rows[rowIndex];
            const textareas = tr.querySelectorAll("td textarea");
            colsConfig.forEach((colConf, colIndex) => {
                if (textareas[colIndex]) {
                    textareas[colIndex].value = dataRow[colConf.key] || "";
                }
            });
        }
    });
}

function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
        let char = line[i];
        if (char === '"') {
            if (inQuotes && i + 1 < line.length && line[i+1] === '"') { 
                current += '"';
                i++; 
            } else {
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            result.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    result.push(current); 
    return result.map(val => val.trim()); 
}

// === FUNGSI ADUN CERITA DIKEMASKINI DI SINI ===
function adunDanSalinPromptAI(platformAI) {
    const tableData = getTableData(); 
    if (tableData.length === 0 || tableData.every(row => colsConfig.every(col => !(row[col.key] && row[col.key].trim())))) {
        showAlert("Tiada data di papan cerita untuk diadun atau semua medan kosong.", "warning");
        return;
    }

    let promptTeks = "Arahan untuk AI: Berdasarkan elemen-elemen cerita ringkas dari papan cerita ini, sila hasilkan sebuah **karangan naratif pendek, maksimum sekitar 260 patah perkataan**. Karangan ini perlu merangkumi dan mengembangkan setiap tahap plot yang diberikan (Mula Cerita, Masalah, Penyelesaian, Akhir Cerita) menjadi satu penceritaan yang koheren dan kreatif. Fokus pada penceritaan yang jelas dan padat.\n\n";
    promptTeks += "JUDUL CADANGAN (boleh diubah oleh AI): 'Legenda Benih Ajaib SuperTebar'\n\n"; // Contoh judul

    tableData.forEach(row => {
        promptTeks += `## TAHAP PLOT: ${row.plot_label}\n`; 
        let plotHasContent = false; // Untuk semak jika plot ini ada isi
        colsConfig.forEach(col => { 
            const nilai = row[col.key] || ""; 
            if (nilai.trim() !== "") { 
                 promptTeks += `   * ${col.label}: ${nilai}\n`;
                 plotHasContent = true;
            }
        });
        if (!plotHasContent) {
            promptTeks += `   * (Tiada perincian untuk tahap plot ini)\n`;
        }
        promptTeks += "\n";
    });

    promptTeks += "Pastikan output adalah satu blok karangan naratif yang mengalir, bukan lagi dalam bentuk poin-poin seperti input. Elakkan pengulangan frasa yang tidak perlu.\n";
    // Pengguna boleh menambah gaya spesifik secara manual di platform AI jika perlu

    navigator.clipboard.writeText(promptTeks).then(() => {
        let urlAI = "";
        let namaAI = "";

        switch (platformAI) {
            case 'gemini': urlAI = "https://gemini.google.com/app"; namaAI = "Google Gemini"; break;
            case 'chatgpt': urlAI = "https://chat.openai.com/"; namaAI = "ChatGPT"; break;
            case 'claude': urlAI = "https://claude.ai/"; namaAI = "Claude"; break;
            case 'umum':
                showAlert("✅ Prompt telah disalin ke papan klip! Sila tampal di platform AI pilihan anda.", "success");
                return; 
            default: showAlert("Platform AI tidak dikenali.", "warning"); return;
        }
        window.open(urlAI, "_blank");
        showAlert(`✅ Prompt disalin! Sila tampal di ${namaAI} yang telah dibuka di tetingkap baru.`, "success");
    }).catch(err => {
        showAlert("Gagal menyalin prompt. Sila cuba salin secara manual.", "warning");
        console.error('Gagal menyalin prompt: ', err);
        const tempPromptArea = document.createElement('textarea');
        tempPromptArea.style.position = 'fixed'; tempPromptArea.style.left = '-9999px';
        tempPromptArea.value = promptTeks; document.body.appendChild(tempPromptArea);
        tempPromptArea.select(); document.body.removeChild(tempPromptArea);
        console.log("--- PROMPT UNTUK DISALIN MANUAL ---\n", promptTeks); 
    });
}
// === AKHIR FUNGSI ADUN CERITA YANG DIKEMASKINI ===

function bukaEditor() {
  const editorContainer = document.getElementById("richEditorContainer");
  if (editorContainer) {
      const isVisible = editorContainer.style.display === "block";
      editorContainer.style.display = isVisible ? "none" : "block";
      if (!isVisible) editorContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
  } else { showAlert("Kontena Rich Text Editor tidak ditemui.", "danger"); }
}

function simpanEditor() {
  const editor = document.getElementById("richEditor");
  if (!editor) { showAlert("Rich Text Editor tidak ditemui.", "danger"); return; }
  const isi = editor.innerHTML; 
  const isiTeks = editor.innerText; 
  const formatPilihan = document.getElementById("saveFormat").value;
  const filename = "karangan_dari_editor_bc_junior"; 

  try {
    if (formatPilihan === "html") downloadFile(filename + ".html", `<html><head><meta charset="utf-8"><title>${filename}</title></head><body>${isi}</body></html>`, "text/html");
    else if (formatPilihan === "txt") downloadFile(filename + ".txt", isiTeks, "text/plain");
    else if (formatPilihan === "json_karangan") { 
      const obj = { tajuk: filename, kandungan_html: isi, kandungan_teks: isiTeks };
      downloadFile(filename + "_karangan.json", JSON.stringify(obj, null, 2), "application/json");
    } else if (formatPilihan === "csv_karangan") { 
      const csv = `"Kandungan Karangan"\n"${isiTeks.replace(/"/g, '""').replace(/\n/g, '\\n')}"`;
      downloadFile(filename + "_karangan.csv", csv, "text/csv");
    } else if (formatPilihan === "xml_karangan") { 
      const safeIsi = isiTeks.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
      const xml = `<Karangan>\n  <Tajuk>${filename}</Tajuk>\n  <Isi><![CDATA[${safeIsi}]]></Isi>\n</Karangan>`;
      downloadFile(filename + "_karangan.xml", xml, "application/xml");
    } else if (formatPilihan === "doc") {
      const blob = new Blob(['<html><head><meta charset="utf-8"></head><body>' + isi + '</body></html>'], { type: "application/msword" });
      downloadFile(filename + ".doc", blob, "application/msword");
    } else if (formatPilihan === "pdf") {
      showAlert("Fungsi simpan sebagai PDF memerlukan implementasi lanjut. Sila gunakan 'Cetak ke PDF' dari pelayar.", "info");
    }
    if(formatPilihan !== "pdf") showAlert(`Karangan berjaya dieksport sebagai ${formatPilihan.toUpperCase().replace("_KARANGAN","")}.`, "success");
  } catch (error) {
    showAlert(`Gagal mengeksport karangan: ${error.message}`, "danger");
    console.error("Ralat simpan editor:", error);
  }
}

function simpanDrafDanTeruskan() {
    const tableData = getTableData(); 
    if (tableData.length === 0 || tableData.every(row => colsConfig.every(col => !(row[col.key] && row[col.key].trim())))) {
        showAlert("Papan cerita kosong atau semua medan kosong. Sila isi sekurang-kurangnya satu medan sebelum menyimpan.", "warning");
        return;
    }
    try {
        localStorage.setItem('drafCeritaBasic', JSON.stringify(tableData));
        showAlert("Draf cerita asas telah disimpan! Meneruskan ke modul Bina Watak...", "success");
        setTimeout(() => { window.location.href = '../../bina_watak/bina_watak.html'; }, 1500);
    } catch (error) {
        showAlert(`Gagal menyimpan draf: ${error.message}. Sila cuba eksport secara manual.`, "danger");
        console.error("Ralat simpan ke localStorage:", error);
    }
}

function showAlert(message, type = 'info') {
    const alertContainer = document.body; 
    let alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show fixed-top m-3`; 
    alertDiv.style.zIndex = "2000"; 
    alertDiv.setAttribute('role', 'alert');
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    const existingAlert = document.querySelector('.alert.fixed-top');
    if(existingAlert) existingAlert.remove();
    alertContainer.appendChild(alertDiv); 
    setTimeout(() => {
        if (alertDiv && alertDiv.parentElement) { 
            const bsAlert = (typeof bootstrap !== 'undefined' && bootstrap.Alert) ? bootstrap.Alert.getInstance(alertDiv) : null;
            if (bsAlert) bsAlert.close(); else alertDiv.remove(); 
        }
    }, 5000); 
}

document.addEventListener('DOMContentLoaded', () => {
    populateTableHeader(); 
    populateTable();       

    const importCsvButtonLabel = document.querySelector("button[onclick='importCSV()']"); 
    const fileInputElement = document.getElementById("fileInputCSV"); 
    
    if (importCsvButtonLabel && fileInputElement && !importCsvButtonLabel.dataset.listenerAttached) { 
        importCsvButtonLabel.addEventListener('click', (e) => {
            e.preventDefault(); 
            fileInputElement.click();
        });
        importCsvButtonLabel.dataset.listenerAttached = "true";
    }
    
    const dropZone = document.getElementById("dropZone");
    if (dropZone && !dropZone.dataset.listenerAttached) {
      dropZone.addEventListener("dragover", e => { e.preventDefault(); dropZone.classList.add("dragover"); });
      dropZone.addEventListener("dragleave", () => { dropZone.classList.remove("dragover"); });
      dropZone.addEventListener("drop", e => {
        e.preventDefault();
        dropZone.classList.remove("dragover");
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const file = e.dataTransfer.files[0];
            if (file && file.name.endsWith(".csv")) { 
                 handleFile(file); // Hantar objek File terus, bukan event
            } else if (file) {
                showAlert("Hanya fail .csv dibenarkan untuk diseret ke sini.", "warning");
            }
        }
      });
      dropZone.dataset.listenerAttached = "true";
    }
});