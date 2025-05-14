// bina_watak/script_bina_watak.js - 12 Mei 2025, 05:25 PM +08
// Termasuk fungsi "Set Semula Halaman" global dan papar borang automatik.

document.addEventListener('DOMContentLoaded', () => {
    // Rujukan Elemen DOM Utama
    const btnTambahWatak = document.getElementById('btnTambahWatak');
    const senaraiWatakContainer = document.getElementById('senaraiWatakContainer');
    const templateBorangWatak = document.getElementById('templateBorangWatak');
    const placeholderWatak = document.getElementById('placeholderWatak');

    const drafCeritaRefContainer = document.getElementById('drafCeritaRefContainer');
    const drafCeritaPreview = document.getElementById('drafCeritaPreview');

    const tajukProjekInput = document.getElementById('tajukProjek');
    const genreProjekInput = document.getElementById('genreProjek');
    const sinopsisProjekInput = document.getElementById('sinopsisProjek');

    const btnSimpanDanTeruskan = document.getElementById('btnSimpanDanTeruskanKeKontrol');
    const btnMuatTurunDataProjek = document.getElementById('btnMuatTurunDataProjek');
    const btnMuatNaikDataProjek = document.getElementById('btnMuatNaikDataProjek');
    const inputMuatNaikDataProjek = document.getElementById('inputMuatNaikDataProjek');
    const btnSetSemulaHalamanGlobal = document.getElementById('btnSetSemulaHalamanGlobal'); 

    let dataProjek = {
        infoKomik: { tajukProjek: "", genreUtama: "", sinopsisRingkasProjek: "" },
        senaraiWatak: [] 
    };
    let idWatakCounter = 0;

    function showAlert(message, type = 'info') {
        const alertContainer = document.body; 
        let alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show fixed-top m-3`; 
        alertDiv.style.zIndex = "2050"; 
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
    
    function kemaskiniPlaceholderWatak() {
        if(placeholderWatak && senaraiWatakContainer) {
            placeholderWatak.style.display = senaraiWatakContainer.querySelectorAll('.character-card').length === 0 ? 'block' : 'none';
        }
    }

    function pratontonGambar(event, imgPreviewElement, placeholderElement) {
        const file = event.target.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = function(e) {
                if(imgPreviewElement) {
                    imgPreviewElement.src = e.target.result;
                    imgPreviewElement.style.display = 'block';
                }
                if (placeholderElement) placeholderElement.style.display = 'none';
            }
            reader.readAsDataURL(file);
        } else {
            if(imgPreviewElement) {
                imgPreviewElement.src = "#";
                imgPreviewElement.style.display = 'none';
            }
            if (placeholderElement) {
                 placeholderElement.style.display = 'block';
                 placeholderElement.textContent = "Tiada imej dipilih";
            }
            if (file) showAlert("Sila pilih fail imej sahaja (cth: PNG, JPG).", "warning");
        }
        if (event.target) event.target.value = null; 
    }

    function kosongkanSatuBorangWatak(borangDiv) { 
        if (!borangDiv) return;
        borangDiv.querySelectorAll('input[type="text"], input[type="file"], textarea').forEach(input => input.value = "");
        borangDiv.querySelectorAll('select').forEach(select => select.selectedIndex = 0);
        
        const gambarPreview = borangDiv.querySelector('.gambarRujukanPreview');
        const placeholderPreview = borangDiv.querySelector('.pratonton-placeholder');
        if (gambarPreview) {
            gambarPreview.src = "#";
            gambarPreview.style.display = 'none';
        }
        if (placeholderPreview) {
            placeholderPreview.textContent = "Tiada imej dipilih";
            placeholderPreview.style.display = 'block';
        }
    }
    
    function handleKosongkanMedanWatakIni(event) { 
        const borangWatakDiv = event.currentTarget.closest('.character-card');
        if (borangWatakDiv) {
            if (confirm("Anda pasti mahu mengosongkan semua medan untuk profil watak ini?")) {
                kosongkanSatuBorangWatak(borangWatakDiv);
                showAlert("Medan untuk watak ini telah dikosongkan.", "info");
            }
        }
    }

    function padamWatak(event) { 
        const borangWatakDiv = event.currentTarget.closest('.character-card');
        if (borangWatakDiv) {
            if (confirm("Anda pasti mahu memadam profil watak ini secara kekal?")) {
                const idInternal = borangWatakDiv.dataset.idInternal;
                if (dataProjek && dataProjek.senaraiWatak) {
                    dataProjek.senaraiWatak = dataProjek.senaraiWatak.filter(w => w.idUnikWatak !== idInternal);
                }
                borangWatakDiv.remove();
                showAlert("Profil watak telah dipadam.", "info");
                kemaskiniPlaceholderWatak();
                if (senaraiWatakContainer.querySelectorAll('.character-card').length === 0) {
                    tambahBorangWatakBaru(); 
                }
            }
        }
    }

    function janaPromptAIUntukWatak(event, borangWatakDiv) {
        // ... (fungsi janaPromptAIUntukWatak kekal sama seperti versi 11:49 AM) ...
        const namaWatakInput = borangWatakDiv.querySelector('.namaWatakInput');
        const deskripsiImejTextarea = borangWatakDiv.querySelector('.deskripsiImejRujukanTextarea');
        const perananSelect = borangWatakDiv.querySelector('.perananWatakSelect');
        const namaWatak = namaWatakInput ? namaWatakInput.value.trim() : "";
        const deskripsiImej = deskripsiImejTextarea ? deskripsiImejTextarea.value.trim() : "";
        const peranan = perananSelect ? perananSelect.value : "";
        if (!namaWatak) {
            showAlert("Sila masukkan Nama Watak dahulu.", "warning");
            if (namaWatakInput) namaWatakInput.focus();
            return;
        }
        let promptTeks = `Arahan untuk AI:\n\nNama Watak: "${namaWatak}"\n`;
        if(deskripsiImej) promptTeks += `Deskripsi Imej Rujukan / Konsep Visual Asas: "${deskripsiImej}"\n`;
        else promptTeks += `(Tiada deskripsi imej rujukan diberikan, sila jana berdasarkan nama dan peranan jika ada)\n`;
        if(peranan) promptTeks += `Peranan Watak: "${peranan}" (AI boleh cadangkan peranan lain jika lebih sesuai)\n`;
        promptTeks += `\nBerdasarkan maklumat di atas, sila hasilkan perincian watak yang komprehensif untuk sebuah komik. Berikan cadangan untuk:\n1.  Personaliti / Sifat Utama (3-5 kata sifat utama)\n2.  Latar Belakang / Sejarah Ringkas (Asal usul, peristiwa penting)\n3.  Motivasi / Matlamat Watak Utama (Apa yang mendorongnya?)\n4.  Kelebihan / Kekuatan Utama (Kuasa, kemahiran, sifat positif)\n5.  Kelemahan / Ketakutan\n6.  Perincian Penampilan Visual Tambahan (untuk konsistensi dalam komik):\n    * Jantina & Anggaran Umur Visual:\n    * Bentuk Badan:\n    * Warna & Gaya Rambut Utama:\n    * Warna Mata (Jika signifikan):\n    * Warna Kulit:\n    * Pakaian Lazim/Ikonik (Deskripsi ringkas):\n    * Aksesori Khas/Penting (Jika ada, atau cadangan):\n    * Ekspresi Wajah Tipikal:\n    * Ciri Unik Visual Lain (Parut, tanda siber, dll.):\n7.  Cadangan Dialog atau Slogan Tipikal:\n\nSila hasilkan dalam format yang mudah untuk saya salin dan agih-agihkan ke dalam medan-medan berasingan. Fokus pada idea kreatif dan unik yang sesuai dengan nama dan konsep visual (jika ada).`;
        navigator.clipboard.writeText(promptTeks).then(() => {
            showAlert(`✅ Prompt untuk perincian watak '${namaWatak}' telah disalin! Sila tampal di platform AI pilihan anda.`, "success");
        }).catch(err => {
            showAlert("Gagal menyalin prompt. Sila cuba salin secara manual.", "warning");
            console.error('Gagal menyalin prompt: ', err);
            console.log(`--- PROMPT PERINCIAN WATAK ${namaWatak.toUpperCase()} UNTUK DISALIN MANUAL ---\n`, promptTeks); 
        });
    }

    function tambahBorangWatakBaru(dataWatak = null) {
        if (!templateBorangWatak || !templateBorangWatak.content) {
            console.error("Kritikal: Templat #templateBorangWatak tidak ditemui.");
            showAlert("Ralat: Templat borang watak tidak dapat dimuatkan.", "danger"); return;
        }
        if (!senaraiWatakContainer) {
            console.error("Kritikal: Kontena #senaraiWatakContainer tidak ditemui.");
            showAlert("Ralat: Kontena untuk borang watak tidak dapat dimuatkan.", "danger"); return;
        }

        const klonNode = templateBorangWatak.content.cloneNode(true);
        const borangWatakDiv = klonNode.querySelector('.character-card');
        if (!borangWatakDiv) {
            console.error("Kritikal: Elemen .character-card tidak ditemui dalam templat.");
            showAlert("Ralat: Struktur templat borang watak tidak betul.", "danger"); return;
        }
        
        idWatakCounter++;
        const idInternalBorang = (dataWatak && dataWatak.idUnikWatak) ? dataWatak.idUnikWatak : `borangWatak_${idWatakCounter}_${Date.now()}`;
        borangWatakDiv.setAttribute('data-id-internal', idInternalBorang);

        const characterTitle = borangWatakDiv.querySelector('.character-title');
        if (characterTitle) {
            const bilanganBorangSemasa = senaraiWatakContainer.querySelectorAll('.character-card').length + 1;
            characterTitle.textContent = (dataWatak && dataWatak.namaWatak) ? `Sunting Watak: ${dataWatak.namaWatak}` : `Profil Watak #${bilanganBorangSemasa}`;
        }

        const btnPadam = borangWatakDiv.querySelector('.btnPadamWatak');
        if (btnPadam) btnPadam.addEventListener('click', padamWatak);
        
        const btnKosongkanMedan = borangWatakDiv.querySelector('.btnKosongkanMedanWatakIni'); 
        if (btnKosongkanMedan) btnKosongkanMedan.addEventListener('click', handleKosongkanMedanWatakIni);

        const gambarInput = borangWatakDiv.querySelector('.gambarRujukanInput');
        const gambarPreview = borangWatakDiv.querySelector('.gambarRujukanPreview');
        const placeholderPreview = borangWatakDiv.querySelector('.pratonton-placeholder');
        if (gambarInput && gambarPreview && placeholderPreview) {
            gambarInput.addEventListener('change', (e) => pratontonGambar(e, gambarPreview, placeholderPreview));
        }

        const btnJanaAI = borangWatakDiv.querySelector('.btnJanaAICadanganWatak');
        if (btnJanaAI) {
            btnJanaAI.addEventListener('click', (e) => janaPromptAIUntukWatak(e, borangWatakDiv));
        }
        
        if (dataWatak) {
            isiBorangDenganData(borangWatakDiv, dataWatak);
        } else {
            // Pastikan pratonton imej diset dengan betul untuk borang baru yang kosong
            if(placeholderPreview && gambarPreview){
                placeholderPreview.textContent = "Tiada imej dipilih";
                gambarPreview.src = "#"; // Elak src kosong
                gambarPreview.style.display = 'none';
                placeholderPreview.style.display = 'block';
            }
        }

        senaraiWatakContainer.appendChild(klonNode);
        kemaskiniPlaceholderWatak();
    }
    
    function isiBorangDenganData(borangDiv, data) {
        // ... (fungsi isiBorangDenganData kekal sama seperti versi 11:49 AM) ...
        const setInputValue = (selector, value) => {
            const el = borangDiv.querySelector(selector);
            if (el) el.value = value || ""; else console.warn(`Elemen tidak ditemui dalam borang (isiBorang): ${selector}`);
        };
        setInputValue('.namaWatakInput', data.namaWatak);
        setInputValue('.perananWatakSelect', data.peranan);
        setInputValue('.deskripsiImejRujukanTextarea', data.deskripsiImejRujukan);
        setInputValue('.personalitiKunciInput', data.personalitiKunci);
        setInputValue('.motivasiUtamaInput', data.motivasiUtama);
        setInputValue('.latarBelakangTextarea', data.latarBelakangRingkas);
        setInputValue('.kelebihanTextarea', data.kelebihan);
        setInputValue('.kelemahanTextarea', data.kelemahan);
        if (data.penampilanVisual) {
            setInputValue('.jantinaUmurInput', data.penampilanVisual.jantinaUmurVisual);
            setInputValue('.bentukBadanInput', data.penampilanVisual.bentukBadan);
            setInputValue('.rambutInput', data.penampilanVisual.warnaRambutGaya);
            setInputValue('.warnaMataInput', data.penampilanVisual.warnaMata);
            setInputValue('.warnaKulitInput', data.penampilanVisual.warnaKulit);
            setInputValue('.pakaianLazimTextarea', data.penampilanVisual.pakaianLazim);
            setInputValue('.aksesoriKhasInput', data.penampilanVisual.aksesoriKhas);
            setInputValue('.ekspresiWajahInput', data.penampilanVisual.ekspresiWajahTipikal);
            setInputValue('.ciriUnikInput', data.penampilanVisual.ciriUnikVisual);
        }
        setInputValue('.sloganTextarea', data.slogan || data.dialogSloganTipikal); 
        setInputValue('.catatanWatakTextarea', data.catatanTambahan);
        const gambarInput = borangDiv.querySelector('.gambarRujukanInput');
        if(gambarInput) gambarInput.value = ""; 
        const placeholderPreview = borangDiv.querySelector('.pratonton-placeholder');
        const gambarPreview = borangDiv.querySelector('.gambarRujukanPreview');
        if(placeholderPreview && gambarPreview) { 
            placeholderPreview.textContent = "Pilih imej baru jika perlu."; 
            if (data.gambarRujukanDataURL) { 
                gambarPreview.src = data.gambarRujukanDataURL;
                gambarPreview.style.display = 'block';
                placeholderPreview.style.display = 'none';
            } else {
                gambarPreview.src = "#"; 
                gambarPreview.style.display = 'none';
                placeholderPreview.style.display = 'block';
            }
        }
    }

    function muatDrafCeritaRujukan() {
        // ... (fungsi muatDrafCeritaRujukan kekal sama seperti versi 11:49 AM) ...
        try {
            const drafCeritaString = localStorage.getItem('drafCeritaBasic');
            if (drafCeritaString && drafCeritaRefContainer && drafCeritaPreview) {
                const drafCerita = JSON.parse(drafCeritaString);
                let formattedText = "Rujukan Draf Cerita Asas (dari BC Junior):\n\n";
                const colsConfigFromBCJunior = [ 
                    { label: "Orang & Tempat", key: "orang_tempat" },
                    { label: "Peristiwa", key: "peristiwa" },
                    { label: "Perasaan", key: "perasaan" },
                    { label: "Dialog Ringkas", key: "dialog_ringkas" }
                ];
                if (Array.isArray(drafCerita)) {
                    drafCerita.forEach(plot => {
                        formattedText += `PLOT: ${plot.plot_label || 'Tidak Diketahui'}\n`;
                        colsConfigFromBCJunior.forEach(col => { 
                             if (plot[col.key] && plot[col.key].trim() !== "") { 
                                formattedText += `  - ${col.label}: ${plot[col.key]}\n`;
                             }
                        });
                        formattedText += "\n";
                    });
                } else { 
                    formattedText += JSON.stringify(drafCerita, null, 2); 
                }
                drafCeritaPreview.textContent = formattedText;
                drafCeritaRefContainer.style.display = 'block';
            } else {
                if (drafCeritaRefContainer) drafCeritaRefContainer.style.display = 'none';
            }
        } catch (error) {
            console.error("Ralat memuatkan draf cerita dari localStorage:", error);
        }
    }
    
    function kumpulSemuaDataProjek() {
        // ... (fungsi kumpulSemuaDataProjek kekal sama seperti versi 11:49 AM) ...
        const dataTerkumpul = {
            infoKomik: {
                tajukProjek: tajukProjekInput ? tajukProjekInput.value.trim() : "",
                genreUtama: genreProjekInput ? genreProjekInput.value.trim() : "",
                sinopsisRingkasProjek: sinopsisProjekInput ? sinopsisProjekInput.value.trim() : ""
            },
            senaraiWatak: []
        };
        const semuaBorangWatak = senaraiWatakContainer.querySelectorAll('.character-card');
        semuaBorangWatak.forEach(borangDiv => {
            const idInternal = borangDiv.dataset.idInternal;
            const penampilanData = {
                jantinaUmurVisual: borangDiv.querySelector('.jantinaUmurInput')?.value.trim() || "",
                bentukBadan: borangDiv.querySelector('.bentukBadanInput')?.value.trim() || "",
                warnaRambutGaya: borangDiv.querySelector('.rambutInput')?.value.trim() || "",
                warnaMata: borangDiv.querySelector('.warnaMataInput')?.value.trim() || "",
                warnaKulit: borangDiv.querySelector('.warnaKulitInput')?.value.trim() || "",
                pakaianLazim: borangDiv.querySelector('.pakaianLazimTextarea')?.value.trim() || "",
                aksesoriKhas: borangDiv.querySelector('.aksesoriKhasInput')?.value.trim() || "",
                ekspresiWajahTipikal: borangDiv.querySelector('.ekspresiWajahInput')?.value.trim() || "",
                ciriUnikVisual: borangDiv.querySelector('.ciriUnikInput')?.value.trim() || ""
            };
            const dataSatuWatak = {
                idUnikWatak: idInternal, 
                namaWatak: borangDiv.querySelector('.namaWatakInput')?.value.trim() || "",
                peranan: borangDiv.querySelector('.perananWatakSelect')?.value || "",
                deskripsiImejRujukan: borangDiv.querySelector('.deskripsiImejRujukanTextarea')?.value.trim() || "",
                personalitiKunci: borangDiv.querySelector('.personalitiKunciInput')?.value.trim() || "",
                motivasiUtama: borangDiv.querySelector('.motivasiUtamaInput')?.value.trim() || "",
                latarBelakangRingkas: borangDiv.querySelector('.latarBelakangTextarea')?.value.trim() || "",
                kelebihan: borangDiv.querySelector('.kelebihanTextarea')?.value.trim() || "",
                kelemahan: borangDiv.querySelector('.kelemahanTextarea')?.value.trim() || "",
                penampilanVisual: penampilanData,
                slogan: borangDiv.querySelector('.sloganTextarea')?.value.trim() || "", 
                catatanTambahan: borangDiv.querySelector('.catatanWatakTextarea')?.value.trim() || ""
            };
            dataTerkumpul.senaraiWatak.push(dataSatuWatak);
        });
        dataProjek = dataTerkumpul; 
        return dataTerkumpul;
    }

    function simpanDataKeLocalStorage() {
        // ... (fungsi simpanDataKeLocalStorage kekal sama seperti versi 11:49 AM) ...
        const dataUntukDisimpan = kumpulSemuaDataProjek();
        const adaInfoKomik = Object.values(dataUntukDisimpan.infoKomik).some(val => typeof val === 'string' && val.trim() !== "");
        const adaWatakSignifikan = dataUntukDisimpan.senaraiWatak.some(watak => 
            Object.values(watak).some(val => 
                (typeof val === 'string' && val.trim() !== "") || 
                (typeof val === 'object' && val !== null && Object.values(val.penampilanVisual || {}).some(pVal => typeof pVal === 'string' && pVal.trim() !== ""))
            )
        );
        if (!adaInfoKomik && !adaWatakSignifikan) { return false; }
        try {
            localStorage.setItem('dataProjekKomikBCPS', JSON.stringify(dataUntukDisimpan));
            return true;
        } catch (error) {
            showAlert(`Gagal menyimpan data: ${error.message}.`, "danger");
            return false;
        }
    }
    
    function muatDataProjekDariLocalStorage() {
        // ... (fungsi muatDataProjekDariLocalStorage kekal sama seperti versi 11:49 AM) ...
        let dataWatakBerjayaDimuat = false;
        try {
            const dataString = localStorage.getItem('dataProjekKomikBCPS');
            if (dataString) {
                const dataDimuat = JSON.parse(dataString);
                dataProjek = dataDimuat; 
                if (dataDimuat.infoKomik) {
                    if(tajukProjekInput) tajukProjekInput.value = dataDimuat.infoKomik.tajukProjek || "";
                    if(genreProjekInput) genreProjekInput.value = dataDimuat.infoKomik.genreUtama || "";
                    if(sinopsisProjekInput) sinopsisProjekInput.value = dataDimuat.infoKomik.sinopsisRingkasProjek || "";
                }
                if (dataDimuat.senaraiWatak && Array.isArray(dataDimuat.senaraiWatak) && dataDimuat.senaraiWatak.length > 0) {
                    if(senaraiWatakContainer) senaraiWatakContainer.innerHTML = ''; 
                    idWatakCounter = 0; 
                    dataDimuat.senaraiWatak.forEach(watak => { tambahBorangWatakBaru(watak); });
                    dataWatakBerjayaDimuat = true; 
                }
                const adaInfo = Object.values(dataDimuat.infoKomik || {}).some(v => v && typeof v === 'string' && v.trim());
                if (dataWatakBerjayaDimuat || adaInfo) { /* showAlert("Data projek sedia ada telah dimuatkan.", "info"); */ }
            }
        } catch (error) {
            showAlert(`Gagal memuatkan data dari memori pelayar: ${error.message}`, "warning");
        }
        return dataWatakBerjayaDimuat; 
    }

    function muatTurunDataJSON() {
        // ... (fungsi muatTurunDataJSON kekal sama seperti versi 11:49 AM) ...
        const dataUntukDimuatTurun = kumpulSemuaDataProjek();
        const adaInfoKomik = Object.values(dataUntukDimuatTurun.infoKomik).some(val => typeof val === 'string' && val.trim() !== "");
        const adaWatak = dataUntukDimuatTurun.senaraiWatak.length > 0;
        if (!adaInfoKomik && !adaWatak) { showAlert("Tiada data untuk dimuat turun.", "warning"); return; }
        const jsonStr = JSON.stringify(dataUntukDimuatTurun, null, 2);
        downloadFile("BCPS_ProjekWatakKomik.json", jsonStr, "application/json");
        showAlert("Data projek dan watak sedang dimuat turun sebagai JSON.", "success");
    }

    function handleMuatNaikDataProjek(event) {
        // ... (fungsi handleMuatNaikDataProjek kekal sama seperti versi 11:49 AM) ...
        const file = event.target.files[0];
        if (!file) return;
        if (file.name.endsWith(".json")) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const dataDimuat = JSON.parse(e.target.result);
                    if (!dataDimuat || typeof dataDimuat.infoKomik !== 'object' || !Array.isArray(dataDimuat.senaraiWatak)) {
                        throw new Error("Struktur fail JSON tidak sah.");
                    }
                    if(tajukProjekInput) tajukProjekInput.value = dataDimuat.infoKomik.tajukProjek || "";
                    if(genreProjekInput) genreProjekInput.value = dataDimuat.infoKomik.genreUtama || "";
                    if(sinopsisProjekInput) sinopsisProjekInput.value = dataDimuat.infoKomik.sinopsisRingkasProjek || "";
                    if(senaraiWatakContainer) senaraiWatakContainer.innerHTML = ''; 
                    idWatakCounter = 0; 
                    dataDimuat.senaraiWatak.forEach(watak => { tambahBorangWatakBaru(watak); });
                    dataProjek = dataDimuat; 
                    simpanDataKeLocalStorage(); 
                    showAlert("Data projek dan watak berjaya dimuat naik.", "success");
                    kemaskiniPlaceholderWatak(); 
                } catch (error) { showAlert(`Ralat memproses fail JSON: ${error.message}`, "danger"); }
            };
            reader.readAsText(file);
        } else { showAlert("Sila muat naik fail .json sahaja.", "warning"); }
        if (event.target) event.target.value = null; 
    }

    // === FUNGSI BARU UNTUK BUTANG GLOBAL SET SEMULA ===
    function handleSetSemulaHalamanGlobal() {
        if (confirm("Anda mahu simpan semua data Info Projek dan Profil Watak yang ada sekarang SEBELUM mengosongkan halaman?")) {
            muatTurunDataJSON(); 
            setTimeout(() => { 
                lanjutkanDenganPengosonganKonfirmasi();
            }, 500); 
        } else {
            lanjutkanDenganPengosonganKonfirmasi();
        }
    }

    function lanjutkanDenganPengosonganKonfirmasi() {
        if (confirm("Anda PASTI mahu mengosongkan SEMUA medan di halaman ini dan kembali ke keadaan asal? Semua data yang tidak disimpan di paparan akan hilang.")) {
            if(tajukProjekInput) tajukProjekInput.value = "";
            if(genreProjekInput) genreProjekInput.value = "";
            if(sinopsisProjekInput) sinopsisProjekInput.value = "";

            if(senaraiWatakContainer) senaraiWatakContainer.innerHTML = '';

            dataProjek = {
                infoKomik: { tajukProjek: "", genreUtama: "", sinopsisRingkasProjek: "" },
                senaraiWatak: [] 
            };
            idWatakCounter = 0;

            localStorage.removeItem('dataProjekKomikBCPS');
            // Kosongkan juga draf cerita rujukan jika perlu
            // localStorage.removeItem('drafCeritaBasic'); 
            // muatDrafCeritaRujukan(); 

            tambahBorangWatakBaru(); 
            
            showAlert("Halaman telah berjaya diset semula ke keadaan asal.", "info");
        }
    }
    // === AKHIR FUNGSI BARU ===
    
    function simpanDanTeruskanKeKontrol() {
        const berjayaSimpan = simpanDataKeLocalStorage();
        const adaDataUntukDisimpan = (dataProjek.senaraiWatak && dataProjek.senaraiWatak.length > 0) || 
                                   (dataProjek.infoKomik && Object.values(dataProjek.infoKomik).some(v=> v && v.trim()!==""));
        if (berjayaSimpan) { 
            showAlert("Data disimpan! Meneruskan ke Kontrol Komik...", "success");
            setTimeout(() => { window.location.href = '../kontrol_komik/editor_kontrol_komik.html'; }, 1500);
        } else if (!adaDataUntukDisimpan && Object.values(dataProjek.infoKomik).every(v => v.trim() === "") && (!dataProjek.senaraiWatak || dataProjek.senaraiWatak.length === 0) ) { 
             if (confirm("Tiada data untuk disimpan. Tetap mahu teruskan ke Kontrol Komik?")) {
                 setTimeout(() => { window.location.href = '../kontrol_komik/editor_kontrol_komik.html'; }, 500);
            }
        } else { showAlert("Gagal menyimpan data. Tidak dapat meneruskan.", "danger");}
    }
    
    function inisialisasiBinaWatak() {
        if (!btnTambahWatak || !senaraiWatakContainer || !templateBorangWatak || !placeholderWatak) {
            console.error("Satu atau lebih elemen DOM utama untuk Bina Watak tidak ditemui.");
            showAlert("Ralat kritikal: Gagal memuatkan komponen halaman Bina Watak.", "danger");
            return; 
        }

        btnTambahWatak.addEventListener('click', () => tambahBorangWatakBaru());

        if (btnSimpanDanTeruskan) btnSimpanDanTeruskan.addEventListener('click', simpanDanTeruskanKeKontrol);
        if (btnMuatTurunDataProjek) btnMuatTurunDataProjek.addEventListener('click', muatTurunDataJSON);
        if (btnMuatNaikDataProjek && inputMuatNaikDataProjek) {
            btnMuatNaikDataProjek.addEventListener('click', () => inputMuatNaikDataProjek.click());
            inputMuatNaikDataProjek.addEventListener('change', handleMuatNaikDataProjek);
        }
        // Pasang event listener untuk butang global baru
        if (btnSetSemulaHalamanGlobal) { 
            btnSetSemulaHalamanGlobal.addEventListener('click', handleSetSemulaHalamanGlobal);
        }

        muatDrafCeritaRujukan();
        const dataWatakSediaAdaDimuat = muatDataProjekDariLocalStorage(); 

        if (!dataWatakSediaAdaDimuat) { 
            if (senaraiWatakContainer.querySelectorAll('.character-card').length === 0) {
                tambahBorangWatakBaru(); 
            }
        }
        
        kemaskiniPlaceholderWatak(); 
    }

    inisialisasiBinaWatak();
});