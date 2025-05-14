// terbitkan_komik/script_ai_terbit.js

document.addEventListener('DOMContentLoaded', () => {

    // Rujukan Elemen DOM
    const btnGeneratePrompts = document.getElementById('btnGeneratePrompts');
    const promptDisplayArea = document.getElementById('promptDisplayArea');
    const placeholderPrompts = document.getElementById('placeholderPrompts');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const summaryPanelData = document.getElementById('summaryPanelData');
    const btnDownloadAllPrompts = document.getElementById('btnDownloadAllPrompts'); // Rujukan butang baru

    let loadedComicData = null; 
    let currentGeneratedPrompts = []; // Simpan prompt yang telah dijana di sini

    // --- Fungsi Bantuan ---
    function showAlertAI(message, type = 'info') {
        console.log(`[${type.toUpperCase()}] ${message}`);
        // Implementasi alert visual jika perlu
    }

    function downloadFile(filename, content, mimeType = 'text/plain') {
        const blob = new Blob([content], { type: mimeType });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
        showAlertAI(`Fail "${filename}" telah dimuat turun.`, 'success');
    }

    // --- Memuatkan Data Komik ---
    function loadComicData() {
        try {
            const dataString = localStorage.getItem('dataKontrolKomik');
            if (!dataString) {
                summaryPanelData.textContent = "Tiada data panel ditemui dari langkah sebelumnya.";
                if (btnGeneratePrompts) btnGeneratePrompts.disabled = true; // Matikan butang jika tiada data
                if (btnDownloadAllPrompts) btnDownloadAllPrompts.style.display = 'none'; // Sembunyikan butang muat turun
                return null;
            }
            
            const data = JSON.parse(dataString);
            if (!Array.isArray(data)) {
                 throw new Error("Format data panel tidak sah (bukan array).");
            }
            
            loadedComicData = data; 
            if (btnGeneratePrompts) btnGeneratePrompts.disabled = false; // Aktifkan butang jika ada data

            let totalMainPanels = loadedComicData.length;
            let totalSubPanels = 0;
            loadedComicData.forEach(panelUtama => {
                if (panelUtama.subpanel && Array.isArray(panelUtama.subpanel)) {
                    totalSubPanels += panelUtama.subpanel.length;
                }
            });

            summaryPanelData.textContent = `Data dimuatkan: ${totalMainPanels} Panel Utama, ${totalSubPanels} Sub-Panel.`;
            // Jangan tunjukkan alert "berjaya dimuatkan" di sini, biar lebih senyap
            return loadedComicData;

        } catch (error) {
            loadedComicData = null;
            summaryPanelData.textContent = "Ralat memuatkan atau memproses data panel.";
            showAlertAI(`Ralat data panel: ${error.message}`, "danger");
            console.error("Ralat memuatkan dataKontrolKomik:", error);
            if (btnGeneratePrompts) btnGeneratePrompts.disabled = true;
            if (btnDownloadAllPrompts) btnDownloadAllPrompts.style.display = 'none';
            return null;
        }
    }

    // --- Menjana Prompt AI ---
    function generatePrompts(comicData) {
        if (!comicData || comicData.length === 0) {
            return [];
        }
        // ... (Fungsi generatePrompts() yang sama seperti sebelum ini, tidak perlu diubah)
        // Pastikan fungsi ini mengembalikan array objek prompt, cth: 
        // [{ panelIndex: indexPU, subPanelIndex: indexSP, prompt: finalPrompt }]
        // Saya akan salin semula fungsi ini untuk kelengkapan jika anda memerlukannya
        const allPrompts = [];
        comicData.forEach((panelUtamaData, indexPU) => {
            if (panelUtamaData.subpanel && Array.isArray(panelUtamaData.subpanel)) {
                panelUtamaData.subpanel.forEach((subPanelData, indexSP) => {
                    let promptParts = [];
                    if (subPanelData.gaya?.trim()) { promptParts.push(`${subPanelData.gaya.trim()}.`); } 
                    else { promptParts.push("Comic panel style.");}
                    if (subPanelData.sudut?.trim()) { promptParts.push(`${subPanelData.sudut.trim()} shot of`); } 
                    else { promptParts.push("Shot of"); }
                    if (subPanelData.watak?.trim()) { promptParts.push(`${subPanelData.watak.trim()}`); } 
                    else { promptParts.push("a character"); }
                    if (subPanelData.aksi?.trim()) { promptParts.push(`who is ${subPanelData.aksi.trim()}.`); } 
                    else { promptParts.push("."); }
                    let penampilanParts = [];
                    if (subPanelData.penampilan) {
                         if (subPanelData.penampilan.jenis_pakaian?.trim()) penampilanParts.push(`wearing ${subPanelData.penampilan.jenis_pakaian.trim()}`);
                         if (subPanelData.penampilan.warna_pakaian?.trim()) penampilanParts.push(`(${subPanelData.penampilan.warna_pakaian.trim()} color)`);
                         if (subPanelData.penampilan.gaya_rambut?.trim()) penampilanParts.push(`with ${subPanelData.penampilan.gaya_rambut.trim()} hairstyle`);
                         if (subPanelData.penampilan.warna_kulit?.trim()) penampilanParts.push(`(${subPanelData.penampilan.warna_kulit.trim()} skin)`);
                         if (subPanelData.penampilan.aksesori?.trim()) penampilanParts.push(`using ${subPanelData.penampilan.aksesori.trim()} accessory`);
                     }
                    if (penampilanParts.length > 0) { promptParts.push(`Appearance details: ${penampilanParts.join(', ')}.`); }
                    if (subPanelData.penampilan?.ekspresi_wajah?.trim()) { promptParts.push(`Expression: ${subPanelData.penampilan.ekspresi_wajah.trim()}.`); }
                    let finalPrompt = promptParts.join(' ').replace(/\.\s*\./g, '.').trim();
                    allPrompts.push({ panelIndex: indexPU, subPanelIndex: indexSP, prompt: finalPrompt });
                });
            }
        });
        return allPrompts;
    }

    // --- Memaparkan Prompt ---
    function displayPrompts(promptsArray) {
        promptDisplayArea.innerHTML = '';
        if (placeholderPrompts) placeholderPrompts.style.display = 'none';

        if (!promptsArray || promptsArray.length === 0) {
             if (placeholderPrompts) placeholderPrompts.style.display = 'block';
             placeholderPrompts.textContent = "Tiada sub-panel ditemui dalam data untuk menjana prompt.";
             if (btnDownloadAllPrompts) btnDownloadAllPrompts.style.display = 'none'; // Sembunyikan jika tiada prompt
            return;
        }

        promptsArray.forEach(p => {
            // ... (Fungsi displayPrompts() yang sama seperti sebelum ini)
            // Saya salin semula fungsi ini untuk kelengkapan jika anda memerlukannya
            const card = document.createElement('div');
            card.className = 'card'; 
            const cardHeader = document.createElement('div');
            cardHeader.className = 'card-header d-flex justify-content-between align-items-center';
            cardHeader.innerHTML = `
                <span>Panel Utama #${p.panelIndex + 1}, Sub-Panel #${p.subPanelIndex + 1}</span>
                <button class="btn btn-sm btn-outline-light btn-copy-prompt" title="Salin Prompt">
                    <i class="bi bi-clipboard"></i> Salin
                </button>
            `;
            const cardBody = document.createElement('div');
            cardBody.className = 'card-body';
            const promptTextarea = document.createElement('textarea');
            promptTextarea.readOnly = true;
            promptTextarea.value = p.prompt;
            promptTextarea.rows = 4;
            cardBody.appendChild(promptTextarea);
            card.appendChild(cardHeader);
            card.appendChild(cardBody);
            promptDisplayArea.appendChild(card);
            const copyButton = cardHeader.querySelector('.btn-copy-prompt');
            copyButton.addEventListener('click', () => {
                navigator.clipboard.writeText(p.prompt)
                    .then(() => {
                        copyButton.innerHTML = '<i class="bi bi-check-lg"></i> Disalin!';
                        setTimeout(() => { copyButton.innerHTML = '<i class="bi bi-clipboard"></i> Salin'; }, 2000);
                    })
                    .catch(err => {
                        showAlertAI('Gagal menyalin prompt ke papan klip.', 'danger');
                        console.error('Copy error:', err);
                    });
            });
        });
        if (btnDownloadAllPrompts) btnDownloadAllPrompts.style.display = 'inline-block'; // Tunjukkan butang muat turun
    }

    // --- Logik Utama Apabila Butang Dijana Ditekan ---
    function handleGenerateClick() {
         if (!loadedComicData) {
            showAlertAI("Data komik belum dimuatkan. Sila muat semula halaman atau kembali ke langkah sebelumnya.", "warning");
            return;
        }

        if (loadingIndicator) loadingIndicator.style.display = 'block';
        if (placeholderPrompts) placeholderPrompts.style.display = 'none';
        promptDisplayArea.innerHTML = ''; 
        currentGeneratedPrompts = []; // Kosongkan prompt lama
        if (btnDownloadAllPrompts) btnDownloadAllPrompts.style.display = 'none'; // Sembunyikan butang muat turun semasa jana


        setTimeout(() => {
            try {
                const generatedPromptsOutput = generatePrompts(loadedComicData);
                currentGeneratedPrompts = generatedPromptsOutput; // Simpan untuk muat turun
                displayPrompts(generatedPromptsOutput);
                showAlertAI(`Berjaya menjana ${generatedPromptsOutput.length} prompt AI.`, "success");
            } catch (error) {
                showAlertAI(`Ralat semasa menjana atau memaparkan prompt: ${error.message}`, "danger");
                console.error("Prompt generation/display error:", error);
                 if (placeholderPrompts) placeholderPrompts.style.display = 'block';
                 placeholderPrompts.textContent = "Gagal menjana prompt. Sila periksa konsol (F12).";
                 if (btnDownloadAllPrompts) btnDownloadAllPrompts.style.display = 'none';
            } finally {
                if (loadingIndicator) loadingIndicator.style.display = 'none';
            }
        }, 50); 
    }

    // --- Logik untuk Butang Muat Turun Semua Prompt ---
    function handleDownloadAllPrompts() {
        if (!currentGeneratedPrompts || currentGeneratedPrompts.length === 0) {
            showAlertAI("Tiada prompt untuk dimuat turun. Sila jana prompt dahulu.", "warning");
            return;
        }

        let fileContent = "Senarai Prompt AI untuk Komik Anda:\n\n";
        currentGeneratedPrompts.forEach(p => {
            fileContent += `--- Panel Utama #${p.panelIndex + 1}, Sub-Panel #${p.subPanelIndex + 1} ---\n`;
            fileContent += `${p.prompt}\n\n`;
        });

        downloadFile("PromptsAI_Komik.txt", fileContent.trim(), "text/plain");
    }

    // --- Inisialisasi Modul ---
    function initializeAITerbit() {
        loadComicData(); 

        if (btnGeneratePrompts) {
            btnGeneratePrompts.addEventListener('click', handleGenerateClick);
        } else {
            console.error("Butang #btnGeneratePrompts tidak ditemui.");
        }

        // Pasang event listener untuk butang muat turun baru
        if (btnDownloadAllPrompts) {
            btnDownloadAllPrompts.addEventListener('click', handleDownloadAllPrompts);
        } else {
            console.error("Butang #btnDownloadAllPrompts tidak ditemui.");
        }
    }

    initializeAITerbit();
});