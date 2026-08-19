// Kolom: ID, Tanggal, Tipe, Kategori, Jumlah, Catatan, Dompet, Dibuat Pada
var COL = { ID: 1, TANGGAL: 2, TIPE: 3, KATEGORI: 4, JUMLAH: 5, CATATAN: 6, DOMPET: 7, DIBUAT: 8 };

function getTransactions() {
    var sheet = getSheet('Transaksi');
    var data = sheet.getDataRange().getValues();

    if (data.length <= 1) return []; // Hanya header

    var headers = data[0];
    var result = [];

    for (var i = 1; i < data.length; i++) {
        var row = data[i];
        if (!row[0]) continue; // Lewati baris kosong

        var obj = {};
        for (var j = 0; j < headers.length; j++) {
            obj[headers[j]] = serializeCell(headers[j], row[j]);
        }
        result.push(obj);
    }

    return result;
}

function addTransaction(payload) {
    var sheet = getSheet('Transaksi');

    // ID dikirim klien supaya pengiriman ulang dari antrean offline tidak
    // menghasilkan baris ganda. Tanpa ID, server yang membuatkannya.
    var newId = String(payload.id || payload.ID || generateUUID());
    if (findRowById(sheet, newId) > 0) {
        return { id: newId, duplicate: true };
    }

    var timestamp = new Date().toISOString();
    var dompet = payload.dompet || payload.Dompet || payload.wallet || payload.Wallet || 'Tunai';
    // Catatan tidak boleh string kosong agar kolom tidak bergeser saat appendRow.
    var catatan = payload.catatan || payload.Catatan || '-';

    // Dipetakan lewat judul kolom supaya nilai tidak pernah bergeser posisi.
    sheet.appendRow(rowFromObject(sheet, {
        'ID': newId,
        'Tanggal': payload.tanggal || payload.Tanggal || Utilities.formatDate(new Date(), sheetTimeZone(), 'yyyy-MM-dd'),
        'Tipe': payload.tipe || payload.Tipe || 'Pengeluaran',
        'Kategori': payload.kategori || payload.Kategori || 'Lainnya',
        'Jumlah': Number(payload.jumlah || payload.Jumlah) || 0,
        'Catatan': catatan,
        'Dompet': dompet,
        'Dibuat Pada': timestamp
    }));

    return { id: newId, timestamp: timestamp };
}

function updateTransaction(payload) {
    var sheet = getSheet('Transaksi');
    var id = String(payload.id || payload.ID);
    var rowIdx = findRowById(sheet, id);

    if (rowIdx < 1) throw new Error('Transaction not found');

    var tanggal = payload.tanggal || payload.Tanggal;
    var tipe = payload.tipe || payload.Tipe;
    var kategori = payload.kategori || payload.Kategori;
    var jumlah = payload.jumlah !== undefined ? payload.jumlah : payload.Jumlah;
    var catatan = payload.catatan !== undefined ? payload.catatan : payload.Catatan;
    var dompet = payload.dompet || payload.Dompet || payload.wallet;

    if (tanggal) sheet.getRange(rowIdx, COL.TANGGAL).setValue(tanggal);
    if (tipe) sheet.getRange(rowIdx, COL.TIPE).setValue(tipe);
    if (kategori) sheet.getRange(rowIdx, COL.KATEGORI).setValue(kategori);
    if (jumlah !== undefined && jumlah !== null) sheet.getRange(rowIdx, COL.JUMLAH).setValue(Number(jumlah) || 0);
    // Dibandingkan dengan undefined, bukan truthy, supaya catatan bisa dikosongkan.
    if (catatan !== undefined) sheet.getRange(rowIdx, COL.CATATAN).setValue(catatan || '-');
    if (dompet) sheet.getRange(rowIdx, COL.DOMPET).setValue(dompet);

    return { id: id, updated: true };
}

function deleteTransaction(id) {
    var sheet = getSheet('Transaksi');
    var rowIdx = findRowById(sheet, id);

    // Sudah tidak ada = hasil akhir yang diinginkan. Melempar error di sini akan
    // membuat kiriman ulang dari antrean offline gagal selamanya.
    if (rowIdx < 1) return { id: id, deleted: false, missing: true };

    sheet.deleteRow(rowIdx);
    return { id: id, deleted: true };
}


// ---------------------------------------------------------------------------
// Perbaikan sekali jalan untuk baris lama.
// Backend versi pertama hanya menulis 7 nilai (tanpa Dompet), sehingga
// "Dibuat Pada" mendarat di kolom Dompet dan kolom Dibuat Pada kosong.
// Jalankan manual dari editor Apps Script: pilih fungsi ini lalu Run.
// Nilai Dompet baris tersebut memang tidak pernah tersimpan, jadi tidak bisa
// dipulihkan — dikosongkan supaya terbaca "Belum diisi" di aplikasi, bukan
// diam-diam dihitung sebagai Tunai.
// ---------------------------------------------------------------------------
function repairDompetColumn() {
    var sheet = getSheet('Transaksi');
    var lastRow = sheet.getLastRow();
    if (lastRow < 2) return { diperbaiki: 0 };

    var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0]
        .map(function (h) { return String(h).trim(); });
    var colDompet = headers.indexOf('Dompet') + 1;
    var colDibuat = headers.indexOf('Dibuat Pada') + 1;
    if (colDompet < 1 || colDibuat < 1) throw new Error('Kolom Dompet / Dibuat Pada tidak ditemukan');

    var dompetValues = sheet.getRange(2, colDompet, lastRow - 1, 1).getValues();
    var dibuatValues = sheet.getRange(2, colDibuat, lastRow - 1, 1).getValues();
    var fixed = 0;

    for (var i = 0; i < dompetValues.length; i++) {
        var dompet = dompetValues[i][0];
        if (!looksLikeTimestamp(dompet)) continue;

        // Pindahkan timestamp ke kolom yang benar, hanya kalau belum terisi.
        if (dibuatValues[i][0] === '' || dibuatValues[i][0] === null) {
            dibuatValues[i][0] = dompet;
        }
        dompetValues[i][0] = '';
        fixed++;
    }

    if (fixed > 0) {
        sheet.getRange(2, colDompet, dompetValues.length, 1).setValues(dompetValues);
        sheet.getRange(2, colDibuat, dibuatValues.length, 1).setValues(dibuatValues);
    }

    Logger.log(fixed + ' baris diperbaiki (timestamp dipindah dari kolom Dompet).');
    return { diperbaiki: fixed };
}

function looksLikeTimestamp(value) {
    if (value instanceof Date) return true;
    var str = String(value || '').trim();
    return /^\d{4}-\d{2}-\d{2}([T ]|$)/.test(str);
}
