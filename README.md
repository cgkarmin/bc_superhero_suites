# BC Penulis Superhero Suite

## Deskripsi Projek

BC Penulis Superhero Suite adalah satu aplikasi web yang direka untuk membantu penulis dan pencipta komik dalam proses pembangunan idea komik adiwira mereka. Aplikasi ini menyediakan beberapa modul bersepadu yang memudahkan pengguna dari peringkat penciptaan watak, penyusunan panel cerita, hinggalah kepada penjanaan prompt teks untuk digunakan dengan model AI penjana imej.

Projek ini bertujuan untuk mempercepatkan aliran kerja kreatif dan memberikan alat bantu digital kepada pencerita visual.

## Ciri-Ciri Utama / Modul Aplikasi

Aplikasi ini terdiri daripada beberapa modul utama:

1.  **Indeks / Papan Pemuka Utama (`index.html`)**
    * Titik permulaan atau papan pemuka utama aplikasi (anda boleh perincikan lagi fungsi halaman ini).

2.  **Modul Bina Watak (`bina_watak/bina_watak.html`)**
    * Membolehkan pengguna mencipta dan mengurus profil watak-watak adiwira atau penjahat.
    * Butiran watak yang disimpan termasuk nama, peranan, personaliti, motivasi, latar belakang, kelebihan, kelemahan, dan ciri-ciri penampilan visual yang terperinci.
    * Data watak disimpan dalam `localStorage` pelayar (`dataProjekKomikBCPS`) untuk kesinambungan antara sesi.

3.  **Modul Kontrol Komik Editor (`kontrol_komik/kontrol_komik_editor.html`)**
    * Editor visual untuk menyusun struktur panel komik.
    * Pengguna boleh menambah "Panel Utama" dan di bawahnya beberapa "Sub-Panel".
    * Setiap sub-panel boleh diisi dengan butiran seperti:
        * Watak yang terlibat (dimuatkan dari Modul Bina Watak)
        * Aksi / Pergerakan
        * Dialog
        * Sudut Pandang Kamera
        * Gaya Visual Panel
        * Penampilan spesifik watak dalam sub-panel tersebut (pakaian, ekspresi, dll.)
    * Menyokong fungsi muat naik/muat turun data panel dalam format JSON.
    * Data panel komik (`comicData`) disimpan dalam `localStorage` pelayar (`dataKontrolKomik`).

4.  **Modul Terbitkan (AI) (`terbitkan_komik/ai_terbit.html`)**
    * Memuatkan data panel komik yang telah disimpan dari Modul Kontrol Komik Editor.
    * Menjana secara automatik prompt teks deskriptif untuk setiap sub-panel.
    * Prompt ini direka untuk digunakan dengan model AI penjana imej bagi menghasilkan visual untuk komik.
    * Menyediakan fungsi untuk menyalin setiap prompt individu.
    * Menyediakan fungsi untuk memuat turun semua prompt yang telah dijana sebagai satu fail `.txt`.

## Aliran Kerja Pengguna (Dicadangkan)

1.  **Bina Watak:** Mulakan dengan mencipta profil untuk watak-watak utama anda.
2.  **Susun Panel Komik:** Pergi ke Kontrol Komik Editor untuk merangka babak demi babak, panel demi panel, dan masukkan butiran untuk setiap sub-panel.
3.  **Jana Prompt AI:** Buka Modul Terbitkan (AI) untuk mendapatkan prompt teks berdasarkan susunan panel anda.
4.  **Hasilkan Imej:** Salin prompt yang dijana dan gunakan pada platform AI penjana imej pilihan anda.

## Teknologi Digunakan

* HTML5
* CSS3 (Termasuk Bootstrap 5.3 dan tema Pop Art tersuai)
* JavaScript (Vanilla JS untuk logik aplikasi dan manipulasi DOM)

## Struktur Fail (Ringkasan Utama)
