// bina_watak/script_bina_watak.js - 12 Mei 2025, 11:49 AM +08
// Fokus: Memastikan borang watak pertama muncul secara automatik dan fungsi asas borang berjalan.

document.addEventListener('DOMContentLoaded', () => {
    // Rujukan Elemen DOM Utama
    const btnTambahWatak = document.getElementById('btnTambahWatak');
    const senaraiWatakContainer = document.getElementById('senaraiWatakContainer');
    const templateBorangWatak = document.getElementById('templateBorangWatak');
    const placeholderWatak = document.getElementById('placeholderWatak');

    const drafCeritaRefContainer = document.getElementById('drafCeritaRefContainer');
    const drafCeritaPreview = document.getElementById('drafCeritaPreview');

    // Input Info Projek Komik
    const tajukProjekInput = document.getElementById('tajukProjek');
    const genreProjekInput = document.getElementById('genreProjek');
    const sinopsisProjekInput = document.getElementById('sinopsisProjek');

    // Butang Aksi Utama Modul
    const btnSimpanDanTeruskan = document.getElementById('btnSimpanDanTeruskanKeKontrol');
    const btnMuatTurunDataProjek = document.getElementById('btnMuatTurunDataProjek');
    const btnMuatNaikDataProjek = document.getElementById('btnMuatNaikDataProjek');
    const inputMuatNaikDataProjek = document.getElementById('inputMuatNaikDataProjek');

    // Data Aplikasi
    let dataProjek = {
        infoKomik: { tajukProjek: "", genreUtama: "", sinopsisRingkasProjek: "" },
        senaraiWatak: [] 
    };
    let idWatakCounter = 0; // Untuk ID unik sementara borang di DOM

    // --- FUNGSI BANTUAN: ALERT ---
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

    // --- FUNGSI BANTUAN: MUAT TURUN FAIL ---
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
    
    // --- KEMASKINI PLACEHOLDER ---
    function kemaskiniPlaceholderWatak() {
        if(placeholderWatak && senaraiWatakContainer) {
            placeholderWatak.style.display = senaraiWatakContainer.querySelectorAll('.character-card').length === 0 ? 'block' : 'none';
        }
    }

    // --- PRATONTON GAMBAR ---
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

    // --- PADAM WATAK ---
    function padamWatak(event) { 
        const borangWatakDiv = event.currentTarget.closest('.character-card');
        if (borangWatakDiv) {
            if (confirm("Anda pasti mahu memadam profil watak ini?")) {
                const idInternal = borangWatakDiv.dataset.idInternal;
                if (dataProjek && dataProjek.senaraiWatak) {
                    dataProjek.senaraiWatak = dataProjek.senaraiWatak.filter(w => w.idUnikWatak !== idInternal);
                }
                borangWatakDiv.remove();
                showAlert("Profil watak telah dipadam dari paparan.", "info");
                kemaskiniPlaceholderWatak();
            }
        }
    }

    // --- JANA PROMPT AI UNTUK WATAK ---
    function janaPromptAIUntukWatak(event, borangWatakDiv) {
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

        let promptTeks = `Arahan untuk AI:\n\n`;
        promptTeks += `Nama Watak: "${namaWatak}"\n`;
        if(deskripsiImej) {
            promptTeks += `Deskripsi Imej Rujukan / Konsep Visual Asas: "${deskripsiImej}"\n`;
        } else {
            promptTeks += `(Tiada deskripsi imej rujukan diberikan, sila jana berdasarkan nama dan peranan jika ada)\n`;
        }
        if(peranan) promptTeks += `Peranan Watak: "${peranan}" (AI boleh cadangkan peranan lain jika lebih sesuai)\n`;

        promptTeks += `\nBerdasarkan maklumat di atas, sila hasilkan perincian watak yang komprehensif untuk sebuah komik. Berikan cadangan untuk:\n`;
        promptTeks += `1.  Personaliti / Sifat Utama (3-5 kata sifat utama)\n`;
        promptTeks += `2.  Latar Belakang / Sejarah Ringkas (Asal usul, peristiwa penting)\n`;
        promptTeks += `3.  Motivasi / Matlamat Watak Utama (Apa yang mendorongnya?)\n`;
        promptTeks += `4.  Kelebihan / Kekuatan Utama (Kuasa, kemahiran, sifat positif)\n`;
        promptTeks += `5.  Kelemahan / Ketakutan\n`;
        promptTeks += `6.  Perincian Penampilan Visual Tambahan (untuk konsistensi dalam komik):\n`;
        promptTeks += `    * Jantina & Anggaran Umur Visual:\n`;
        promptTeks += `    * Bentuk Badan:\n`;
        promptTeks += `    * Warna & Gaya Rambut Utama:\n`;
        promptTeks += `    * Warna Mata (Jika signifikan):\n`;
        promptTeks += `    * Warna Kulit:\n`;
        promptTeks += `    * Pakaian Lazim/Ikonik (Deskripsi ringkas):\n`;
        promptTeks += `    * Aksesori Khas/Penting (Jika ada, atau cadangan):\n`;
        promptTeks += `    * Ekspresi Wajah Tipikal:\n`;
        promptTeks += `    * Ciri Unik Visual Lain (Parut, tanda siber, dll.):\n`;
        promptTeks += `7.  Cadangan Dialog atau Slogan Tipikal:\n\n`;
        promptTeks += `Sila hasilkan dalam format yang mudah untuk saya salin dan agih-agihkan ke dalam medan-medan berasingan. Fokus pada idea kreatif dan unik yang sesuai dengan nama dan konsep visual (jika ada).`;
        
        navigator.clipboard.writeText(promptTeks).then(() => {
            showAlert(`✅ Prompt untuk perincian watak '${namaWatak}' telah disalin! Sila tampal di platform AI pilihan anda.`, "success");
        }).catch(err => {
            showAlert("Gagal menyalin prompt. Sila cuba salin secara manual.", "warning");
            console.error('Gagal menyalin prompt: ', err);
            console.log(`--- PROMPT PERINCIAN WATAK ${namaWatak.toUpperCase()} UNTUK DISALIN MANUAL ---\n`, promptTeks); 
        });
    }

    // --- PENGURUSAN BORANG WATAK DINAMIK ---
    function tambahBorangWatakBaru(dataWatak = null) {
        if (!templateBorangWatak || !templateBorangWatak.content) {
            console.error("Templat borang watak (#templateBorangWatak) tidak ditemui.");
            showAlert("Ralat: Templat borang watak tidak dapat dimuatkan.", "danger");
            return;
        }
        if (!senaraiWatakContainer) {
            console.error("Kontena senarai watak (#senaraiWatakContainer) tidak ditemui.");
            showAlert("Ralat: Kontena untuk borang watak tidak dapat dimuatkan.", "danger");
            return;
        }

        const klonNode = templateBorangWatak.content.cloneNode(true);
        const borangWatakDiv = klonNode.querySelector('.character-card');
        if (!borangWatakDiv) {
            console.error("Elemen .character-card tidak ditemui dalam templat.");
            showAlert("Ralat: Struktur templat borang watak tidak betul.", "danger");
            return;
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
        }

        senaraiWatakContainer.appendChild(klonNode);
        kemaskiniPlaceholderWatak();
    }
    
    function isiBorangDenganData(borangDiv, data) {
        const setInputValue = (selector, value) => {
            const el = borangDiv.querySelector(selector);
            if (el) el.value = value || "";
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
                             if (plot[col.key]) {
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
        const dataUntukDisimpan = kumpulSemuaDataProjek();
        const adaInfoKomik = Object.values(dataUntukDisimpan.infoKomik).some(val => typeof val === 'string' && val.trim() !== "");
        const adaWatak = dataUntukDisimpan.senaraiWatak.length > 0;

        if (!adaInfoKomik && !adaWatak) {
            return false; 
        }
        try {
            localStorage.setItem('dataProjekKomikBCPS', JSON.stringify(dataUntukDisimpan));
            return true;
        } catch (error) {
            showAlert(`Gagal menyimpan data: ${error.message}.`, "danger");
            return false;
        }
    }
    
    function muatDataProjekDariLocalStorage() {
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
                    dataDimuat.senaraiWatak.forEach(watak => {
                        tambahBorangWatakBaru(watak); 
                    });
                    dataWatakBerjayaDimuat = true; 
                }
                
                const adaInfo = Object.values(dataDimuat.infoKomik || {}).some(v => v && typeof v === 'string' && v.trim());
                if (dataWatakBerjayaDimuat || adaInfo) {
                    // Tidak perlu alert semasa load awal jika pengguna lebih suka borang kosong muncul tanpa notis
                    // showAlert("Data projek sedia ada telah dimuatkan.", "info");
                }
            }
        } catch (error) {
            showAlert(`Gagal memuatkan data dari memori pelayar: ${error.message}`, "warning");
            console.error("Ralat memuat data dari localStorage:", error);
        }
        return dataWatakBerjayaDimuat; 
    }

    function muatTurunDataJSON() {
        const dataUntukDimuatTurun = kumpulSemuaDataProjek();
        const adaInfoKomik = Object.values(dataUntukDimuatTurun.infoKomik).some(val => typeof val === 'string' && val.trim() !== "");
        const adaWatak = dataUntukDimuatTurun.senaraiWatak.length > 0;

        if (!adaInfoKomik && !adaWatak) {
            showAlert("Tiada data untuk dimuat turun.", "warning");
            return;
        }
        const jsonStr = JSON.stringify(dataUntukDimuatTurun, null, 2);
        downloadFile("BCPS_ProjekWatakKomik.json", jsonStr, "application/json");
        showAlert("Data projek dan watak sedang dimuat turun sebagai JSON.", "success");
    }

    function handleMuatNaikDataProjek(event) {
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
                    dataDimuat.senaraiWatak.forEach(watak => {
                        tambahBorangWatakBaru(watak);
                    });
                    
                    dataProjek = dataDimuat; 
                    simpanDataKeLocalStorage(); 

                    showAlert("Data projek dan watak berjaya dimuat naik.", "success");
                    kemaskiniPlaceholderWatak(); 
                } catch (error) {
                    showAlert(`Ralat memproses fail JSON: ${error.message}`, "danger");
                }
            };
            reader.readAsText(file);
        } else {
            showAlert("Sila muat naik fail .json sahaja.", "warning");
        }
        if (event.target) event.target.value = null; 
    }

    function simpanDanTeruskanKeKontrol() {
        const berjayaSimpan = simpanDataKeLocalStorage();
        const adaDataUntukDisimpan = (dataProjek.senaraiWatak && dataProjek.senaraiWatak.length > 0) || 
                                   (dataProjek.infoKomik && Object.values(dataProjek.infoKomik).some(v=> v && v.trim()!==""));

        if (berjayaSimpan) { 
            showAlert("Data disimpan! Meneruskan ke Kontrol Komik...", "success");
            setTimeout(() => {
                window.location.href = '../kontrol_komik/editor_kontrol_komik.html';
            }, 1500);
        } else if (!adaDataUntukDisimpan) { 
             if (confirm("Tiada data untuk disimpan. Tetap mahu teruskan ke Kontrol Komik?")) {
                 setTimeout(() => {
                    window.location.href = '../kontrol_komik/editor_kontrol_komik.html';
                }, 500);
            }
        } else { 
            showAlert("Gagal menyimpan data. Tidak dapat meneruskan.", "danger");
        }
    }
    
    // --- PANGGIL INISIALISASI ---
    inisialisasiBinaWatak();
});