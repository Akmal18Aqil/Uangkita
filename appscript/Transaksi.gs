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

    sheet.appendRow([
        newId,
        payload.tanggal || payload.Tanggal || Utilities.formatDate(new Date(), sheetTimeZone(), 'yyyy-MM-dd'),
        payload.tipe || payload.Tipe || 'Pengeluaran',
        payload.kategori || payload.Kategori || 'Lainnya',
        Number(payload.jumlah || payload.Jumlah) || 0,
        catatan,
        dompet,
        timestamp
    ]);

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
