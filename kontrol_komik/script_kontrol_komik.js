// kontrol_komik/script_kontrol_komik.js - 12 Mei 2025, 07:00 PM +08 (Disemak & Dilengkapkan)
// Rangka awal untuk Kontrol Komik Editor

document.addEventListener('DOMContentLoaded', () => {
    // Rujukan Elemen DOM Utama
    const editorArea = document.getElementById('editorAreaKontrolKomik');
    const placeholderPanelUtama = document.getElementById('placeholderPanelUtama');
    const templatePanelUtama = document.getElementById('templatePanelUtama');
    const templateSubPanel = document.getElementById('templateSubPanel');
    const datalistWatakKontrol = document.getElementById('senaraiWatakDatalistKontrol');

    const btnTambahPanelUtama = document.getElementById('btnTambahPanelUtama');
    const btnMuatNaikJsonPanel = document.getElementById('btnMuatNaikJsonPanel');
    const inputMuatNaikJsonPanel = document.getElementById('inputMuatNaikJsonPanel');
    const btnMuatTurunJsonPanel = document.getElementById('btnMuatTurunJsonPanel');
    const jsonPasteAreaKontrol = document.getElementById('jsonPasteAreaKontrol');
    const btnProsesJsonTampalKontrol = document.getElementById('btnProsesJsonTampalKontrol');
    const btnKosongkanSemuaPanelUtama = document.getElementById('btnKosongkanSemuaPanelUtama');
    const btnSimpanDanKeTerbitkan = document.getElementById('btnSimpanDanKeTerbitkan');

    let comicData = []; 
    let panelUtamaIdCounter = 0; 
    let senaraiNamaWatakDariModul = [];
    let dataProfilWatakLengkap = []; // Untuk simpan keseluruhan profil watak

    // --- FUNGSI BANTUAN ---
    function showAlertKontrol(message, type = 'info') {
        const alertContainer = document.body; 
        let alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show fixed-top m-3`; 
        alertDiv.style.zIndex = "2060"; 
        alertDiv.setAttribute('role', 'alert');
        alertDiv.innerHTML = `${message}<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>`;
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

    function downloadFileKontrol(filename, content, type) {
      const blob = new Blob([content], { type });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link); 
      link.click();
      document.body.removeChild(link); 
      URL.revokeObjectURL(link.href); 
    }

    function kemaskiniPlaceholderPanelUtama() {
        if (placeholderPanelUtama && editorArea) {
            placeholderPanelUtama.style.display = editorArea.querySelectorAll('.panel-utama-card').length === 0 ? 'block' : 'none';
        }
    }
    function kemaskiniPlaceholderSubPanel(panelUtamaElement) {
        if (!panelUtamaElement) return;
        const subpanelContainer = panelUtamaElement.querySelector('.subpanel-container');
        const placeholder = subpanelContainer.querySelector('.placeholder-subpanel');
        if (placeholder && subpanelContainer) {
            placeholder.style.display = subpanelContainer.querySelectorAll('.sub-panel-card').length === 0 ? 'block' : 'none';
        }
    }

    // --- MEMUATKAN DATA WATAK DARI LOCALSTORAGE ---
    function muatSenaraiWatak() {
        try {
            const dataProjekString = localStorage.getItem('dataProjekKomikBCPS'); 
            if (dataProjekString) {
                const dataProjek = JSON.parse(dataProjekString);
                if (dataProjek.senaraiWatak && Array.isArray(dataProjek.senaraiWatak)) {
                    dataProfilWatakLengkap = dataProjek.senaraiWatak; // Simpan data penuh
                    senaraiNamaWatakDariModul = dataProjek.senaraiWatak
                        .map(w => w.namaWatak)
                        .filter(Boolean) 
                        .sort(); 
                    
                    if (datalistWatakKontrol) {
                        datalistWatakKontrol.innerHTML = ''; 
                        senaraiNamaWatakDariModul.forEach(nama => {
                            const option = document.createElement('option');
                            option.value = nama;
                            datalistWatakKontrol.appendChild(option);
                        });
                    }
                }
            } else {
                senaraiNamaWatakDariModul = []; 
                dataProfilWatakLengkap = [];
                 if (datalistWatakKontrol) datalistWatakKontrol.innerHTML = '';
            }
        } catch (error) {
            console.error("Ralat memuatkan senarai watak dari localStorage:", error);
            showAlertKontrol("Gagal memuatkan senarai watak dari modul Bina Watak.", "warning");
            senaraiNamaWatakDariModul = [];
            dataProfilWatakLengkap = [];
            if (datalistWatakKontrol) datalistWatakKontrol.innerHTML = '';
        }
    }
    
    // --- FUNGSI UTAMA RENDER EDITOR ---
    function renderEditor() {
        if (!editorArea) {
            console.error("Kontena editor utama #editorAreaKontrolKomik tidak ditemui.");
            return;
        }
        editorArea.innerHTML = ''; 
        muatSenaraiWatak(); 

        if (comicData.length === 0) {
            kemaskiniPlaceholderPanelUtama();
            return;
        }

        comicData.forEach((panelUtamaData, indexUtama) => {
            const panelUtamaElement = tambahPanelUtamaDOM(indexUtama, panelUtamaData); 
            if (panelUtamaElement && panelUtamaData.subpanel && panelUtamaData.subpanel.length > 0) {
                const subpanelContainer = panelUtamaElement.querySelector('.subpanel-container');
                if (subpanelContainer) { // Pastikan kontena subpanel wujud
                    subpanelContainer.innerHTML = ''; // Kosongkan placeholder atau subpanel lama
                    panelUtamaData.subpanel.forEach((subPanelData, indexSub) => {
                        tambahSubPanelDOM(panelUtamaElement, indexUtama, indexSub, subPanelData);
                    });
                }
            }
            kemaskiniPlaceholderSubPanel(panelUtamaElement); // Kemaskini placeholder selepas semua subpanel ditambah
        });
        kemaskiniPlaceholderPanelUtama();
    }

    // --- FUNGSI PANEL UTAMA ---
    function tambahPanelUtamaDOM(indexPanelUtama, dataPanelUtama = null) {
        if (!templatePanelUtama || !templatePanelUtama.content || !editorArea) {
            showAlertKontrol("Ralat: Templat Panel Utama tidak dapat dimuatkan.", "danger");
            return null;
        }

        const klonNode = templatePanelUtama.content.cloneNode(true);
        const panelCard = klonNode.querySelector('.panel-utama-card');
        
        panelUtamaIdCounter++; // Ini untuk ID DOM unik sementara jika dataPanelUtama tiada id
        const idInternal = (dataPanelUtama && dataPanelUtama.idInternalPanel) ? dataPanelUtama.idInternalPanel : `panelUtama_${panelUtamaIdCounter}`;
        panelCard.setAttribute('data-id-internal-panelutama', idInternal);
        // panelCard.id = idInternal; // ID pada elemen DOM boleh menyebabkan konflik jika tidak unik sepenuhnya

        const titleElement = panelCard.querySelector('.panel-utama-title');
        if (titleElement) titleElement.textContent = `Panel Utama #${indexPanelUtama + 1}`;

        const btnPadam = panelCard.querySelector('.btnPadamPanelUtama');
        if (btnPadam) btnPadam.addEventListener('click', () => padamPanelUtama(indexPanelUtama));
        
        const btnTambahSub = panelCard.querySelector('.btnTambahSubPanel');
        if (btnTambahSub) btnTambahSub.addEventListener('click', () => handleTambahSubPanel(indexPanelUtama));

        editorArea.appendChild(klonNode);
        return panelCard;
    }
    
    function handleTambahPanelUtama() {
        const panelUtamaBaru = {
            // idInternalPanel: `panelUtama_${Date.now()}`, // ID unik untuk data
            subpanel: [] 
        };
        comicData.push(panelUtamaBaru);
        renderEditor(); 
        // Scroll ke panel baru jika perlu
        const panelElements = editorArea.querySelectorAll('.panel-utama-card');
        if (panelElements.length > 0) {
            panelElements[panelElements.length - 1].scrollIntoView({ behavior: 'smooth', block: 'start'});
        }
        showAlertKontrol(`Panel Utama #${comicData.length} telah ditambah.`, 'success');
    }

    function padamPanelUtama(indexPanelUtama) {
        if (confirm(`Anda pasti mahu memadam Panel Utama #${indexPanelUtama + 1} dan semua sub-panel di dalamnya?`)) {
            if (comicData[indexPanelUtama]) {
                comicData.splice(indexPanelUtama, 1);
                renderEditor(); 
                showAlertKontrol(`Panel Utama #${indexPanelUtama + 1} telah dipadam.`, 'info');
            }
        }
    }
    
    function kosongkanSemuaPanelUtama() {
        if (comicData.length === 0) {
            showAlertKontrol("Tiada panel untuk dikosongkan.", "info");
            return;
        }
        if (confirm("Anda pasti mahu memadam SEMUA panel utama dan sub-panel? Tindakan ini akan mengosongkan editor.")) {
            comicData = [];
            panelUtamaIdCounter = 0; 
            renderEditor();
            showAlertKontrol("Semua panel telah dikosongkan.", "info");
        }
    }

    // --- FUNGSI SUB-PANEL ---
    function handleTambahSubPanel(indexPanelUtama) {
        if (comicData[indexPanelUtama]) {
            const subPanelBaru = {
                // idInternalSubPanel: `subPanel_${indexPanelUtama}_${Date.now()}`, // ID unik untuk data
                watak: "", aksi: "", dialog: "", sudut: "", gaya: "",
                penampilan: { warna_pakaian: "", jenis_pakaian: "", aksesori: "", ekspresi_wajah: "", warna_kulit: "", gaya_rambut: "" }
            };
            comicData[indexPanelUtama].subpanel.push(subPanelBaru);
            renderEditor(); 
            // Cari panel utama yang betul untuk scroll
            const panelUtamaElements = editorArea.querySelectorAll('.panel-utama-card');
            if (panelUtamaElements[indexPanelUtama]) {
                 const subPanelCards = panelUtamaElements[indexPanelUtama].querySelectorAll('.sub-panel-card');
                 if (subPanelCards.length > 0) {
                     subPanelCards[subPanelCards.length -1].scrollIntoView({ behavior: 'smooth', block: 'center' });
                 }
            }
            showAlertKontrol(`Sub-Panel baru telah ditambah ke Panel Utama #${indexPanelUtama + 1}.`, 'success');
        }
    }

    function tambahSubPanelDOM(panelUtamaElement, indexPanelUtama, indexSub, dataSubPanel = null) {
        if (!templateSubPanel || !templateSubPanel.content) {
            console.error("Templat sub-panel tidak ditemui."); return null;
        }
        const subpanelContainer = panelUtamaElement.querySelector('.subpanel-container');
        if (!subpanelContainer) {
            console.error("Kontena sub-panel tidak ditemui dalam panel utama."); return null;
        }

        const klonNode = templateSubPanel.content.cloneNode(true);
        const subPanelCard = klonNode.querySelector('.sub-panel-card');
        // Beri ID unik atau data-attribute untuk setiap sub-panel
        const idSubPanelInternal = (dataSubPanel && dataSubPanel.idInternalSubPanel) ? dataSubPanel.idInternalSubPanel : `subpanel_${indexPanelUtama}_${indexSub}_${Date.now()}`;
        subPanelCard.setAttribute('data-id-internal-subpanel', idSubPanelInternal);
        subPanelCard.setAttribute('data-index-panelutama', indexPanelUtama);
        subPanelCard.setAttribute('data-index-subpanel', indexSub);


        const subPanelTitle = subPanelCard.querySelector('.subpanel-title');
        if (subPanelTitle) subPanelTitle.textContent = `Sub-Panel #${indexSub + 1}`;
        
        const btnPadamSub = subPanelCard.querySelector('.btnPadamSubPanel');
        if (btnPadamSub) btnPadamSub.addEventListener('click', () => padamSubPanel(indexPanelUtama, indexSub));

        // Isi medan jika ada dataSubPanel
        if (dataSubPanel) {
            const setInputValue = (selector, value) => {
                const el = subPanelCard.querySelector(selector);
                if (el) el.value = value || "";
            };
            setInputValue('.input-watak', dataSubPanel.watak);
            setInputValue('.input-aksi', dataSubPanel.aksi);
            setInputValue('.input-dialog', dataSubPanel.dialog);
            setInputValue('.input-sudut', dataSubPanel.sudut);
            setInputValue('.input-gaya', dataSubPanel.gaya);
            if (dataSubPanel.penampilan) {
                Object.keys(dataSubPanel.penampilan).forEach(key => {
                    setInputValue(`.input-penampilan-${key.toLowerCase().replace(/_/g, '')}`, dataSubPanel.penampilan[key]);
                });
            }
        }
        
        // Pasang event listener untuk input-input dalam sub-panel ini
        subPanelCard.querySelectorAll('input, textarea, select').forEach(inputEl => {
            inputEl.addEventListener('change', (e) => { // Guna 'change' atau 'input'
                simpanPerubahanDariDOMkeComicData();
            });
        });
        
        subpanelContainer.appendChild(klonNode);
        kemaskiniPlaceholderSubPanel(panelUtamaElement);
        return subPanelCard;
    }
    
    function padamSubPanel(indexPanelUtama, indexSub) {
        if (comicData[indexPanelUtama] && comicData[indexPanelUtama].subpanel[indexSub]) {
            if (confirm(`Anda pasti mahu memadam Sub-Panel #${indexSub + 1} dari Panel Utama #${indexPanelUtama + 1}?`)) {
                comicData[indexPanelUtama].subpanel.splice(indexSub, 1);
                renderEditor();
                showAlertKontrol(`Sub-Panel #${indexSub + 1} dari Panel Utama #${indexPanelUtama + 1} telah dipadam.`, 'info');
            }
        }
    }
    
    // --- MENGUMPUL DATA DARI DOM KE comicData ---
    function simpanPerubahanDariDOMkeComicData() {
        const newComicData = [];
        const panelUtamaElements = editorArea.querySelectorAll('.panel-utama-card');

        panelUtamaElements.forEach((panelUtamaEl, indexPU) => {
            const panelUtamaData = {
                // idInternalPanel: panelUtamaEl.dataset.idInternalPanelutama, // Simpan ID jika perlu
                subpanel: []
            };
            const subPanelElements = panelUtamaEl.querySelectorAll('.sub-panel-card');
            subPanelElements.forEach((subPanelEl, indexSP) => {
                const getInputValue = (selector) => {
                    const el = subPanelEl.querySelector(selector);
                    return el ? el.value.trim() : "";
                };
                const subPanelData = {
                    // idInternalSubPanel: subPanelEl.dataset.idInternalSubpanel,
                    watak: getInputValue('.input-watak'),
                    aksi: getInputValue('.input-aksi'),
                    dialog: getInputValue('.input-dialog'),
                    sudut: getInputValue('.input-sudut'),
                    gaya: getInputValue('.input-gaya'),
                    penampilan: {
                        warna_pakaian: getInputValue('.input-penampilan-warna_pakaian'),
                        jenis_pakaian: getInputValue('.input-penampilan-jenis_pakaian'),
                        aksesori: getInputValue('.input-penampilan-aksesori'),
                        ekspresi_wajah: getInputValue('.input-penampilan-ekspresi_wajah'),
                        warna_kulit: getInputValue('.input-penampilan-warna_kulit'),
                        gaya_rambut: getInputValue('.input-penampilan-gaya_rambut')
                    }
                };
                panelUtamaData.subpanel.push(subPanelData);
            });
            newComicData.push(panelUtamaData);
        });
        comicData = newComicData;
        // console.log("comicData dikemaskini:", JSON.stringify(comicData, null, 2)); // Untuk debug
    }


    // --- FUNGSI MUAT NAIK & MUAT TURUN JSON ---
    function handleMuatNaikJsonPanel(event) {
        const file = event.target.files[0];
        if (!file) return;

        if (file.name.endsWith(".json")) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const dataDimuat = JSON.parse(e.target.result);
                    // Validasi struktur dataDimuat (pastikan ia array panel utama, setiap satu ada subpanel array)
                    if (!Array.isArray(dataDimuat) || !dataDimuat.every(pu => pu.subpanel && Array.isArray(pu.subpanel))) {
                        throw new Error("Struktur fail JSON panel tidak sah.");
                    }
                    comicData = dataDimuat;
                    panelUtamaIdCounter = comicData.length; // Reset berdasarkan data yang dimuat
                    renderEditor();
                    showAlertKontrol("Data panel dari fail JSON berjaya dimuat naik.", "success");
                } catch (error) {
                    showAlertKontrol(`Ralat memproses fail JSON panel: ${error.message}`, "danger");
                }
            };
            reader.readAsText(file);
        } else {
            showAlertKontrol("Sila muat naik fail .json sahaja.", "warning");
        }
        if (event.target) event.target.value = null;
    }

    function prosesJsonTampalKontrol() {
        if (!jsonPasteAreaKontrol) return;
        const jsonString = jsonPasteAreaKontrol.value;
        if (!jsonString.trim()) {
            showAlertKontrol("Sila tampal kandungan teks JSON dahulu.", "warning");
            return;
        }
        try {
            const dataDimuat = JSON.parse(jsonString);
            if (!Array.isArray(dataDimuat) || !dataDimuat.every(pu => pu.subpanel && Array.isArray(pu.subpanel))) {
                throw new Error("Struktur teks JSON panel tidak sah.");
            }
            comicData = dataDimuat;
            panelUtamaIdCounter = comicData.length;
            renderEditor();
            showAlertKontrol("Teks JSON berjaya diproses dan dimuatkan ke editor.", "success");
            jsonPasteAreaKontrol.value = ""; 
        } catch (error) {
            showAlertKontrol(`Ralat memproses teks JSON: ${error.message}`, "danger");
        }
    }

    function handleMuatTurunJsonPanel() {
        simpanPerubahanDariDOMkeComicData(); // Pastikan data terkini diambil dari DOM
        if (comicData.length === 0) {
            showAlertKontrol("Tiada data panel untuk dimuat turun.", "warning");
            return;
        }
        const jsonData = JSON.stringify(comicData, null, 2);
        downloadFileKontrol("KontrolKomik_PanelData.json", jsonData, "application/json");
        showAlertKontrol("Data panel sedang dimuat turun sebagai JSON.", "success");
    }
    
    // --- INISIALISASI & EVENT LISTENER UTAMA ---
    function inisialisasiKontrolKomik() {
        if (!editorArea || !templatePanelUtama || !templateSubPanel) {
            showAlertKontrol("Ralat kritikal: Komponen editor utama tidak ditemui.", "danger");
            return;
        }
        if (btnTambahPanelUtama) btnTambahPanelUtama.addEventListener('click', handleTambahPanelUtama);
        if (btnMuatNaikJsonPanel && inputMuatNaikJsonPanel) {
            btnMuatNaikJsonPanel.addEventListener('click', () => inputMuatNaikJsonPanel.click());
            inputMuatNaikJsonPanel.addEventListener('change', handleMuatNaikJsonPanel);
        }
        if (btnMuatTurunJsonPanel) btnMuatTurunJsonPanel.addEventListener('click', handleMuatTurunJsonPanel);
        if (btnProsesJsonTampalKontrol && jsonPasteAreaKontrol) btnProsesJsonTampalKontrol.addEventListener('click', prosesJsonTampalKontrol);
        if (btnKosongkanSemuaPanelUtama) btnKosongkanSemuaPanelUtama.addEventListener('click', kosongkanSemuaPanelUtama);
        
        if (btnSimpanDanKeTerbitkan) {
            btnSimpanDanKeTerbitkan.addEventListener('click', () => {
                simpanPerubahanDariDOMkeComicData(); // Simpan perubahan terakhir
                // Simpan comicData ke localStorage (atau cara lain) sebelum bernavigasi
                try {
                    localStorage.setItem('dataKontrolKomik', JSON.stringify(comicData));
                    showAlertKontrol("Data panel disimpan! Meneruskan ke modul Terbitkan...", "success");
                    setTimeout(() => {
                        window.location.href = '../terbitkan_komik/ai_terbit.html';
                    }, 1500);
                } catch (e) {
                    showAlertKontrol("Gagal menyimpan data panel sebelum meneruskan.", "danger");
                }
            });
        }
        
        // Cuba muat data dari localStorage jika ada
        const dataDisimpan = localStorage.getItem('dataKontrolKomik');
        if (dataDisimpan) {
            try {
                comicData = JSON.parse(dataDisimpan);
                panelUtamaIdCounter = comicData.length; // Set counter berdasarkan data
            } catch (e) {
                comicData = []; // Jika ralat parse, mula dengan kosong
                localStorage.removeItem('dataKontrolKomik'); // Buang data rosak
            }
        }

        muatSenaraiWatak(); // Muat senarai watak untuk datalist
        renderEditor(); // Render editor berdasarkan comicData yang dimuat atau kosong
    }

    inisialisasiKontrolKomik();
});