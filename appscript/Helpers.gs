// Dinaikkan tiap kali kontrak backend berubah. Dikirim di setiap respons supaya
// frontend bisa tahu kalau Apps Script yang ter-deploy masih versi lama.
var API_VERSION = 2;

function getSheet(sheetName) {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(sheetName);

    // Auto create sheet if doesn't exist
    if (!sheet) {
        sheet = ss.insertSheet(sheetName);
        if (sheetName === 'Transaksi') {
            sheet.appendRow(['ID', 'Tanggal', 'Tipe', 'Kategori', 'Jumlah', 'Catatan', 'Dompet', 'Dibuat Pada']);
        } else if (sheetName === 'Tasks') {
            sheet.appendRow(['ID', 'Judul', 'Deskripsi', 'Prioritas', 'Status', 'Deadline', 'Kategori', 'CalendarEventId', 'Dibuat Pada']);
        }
        sheet.setFrozenRows(1);
    }

    return sheet;
}

function sheetTimeZone() {
    return SpreadsheetApp.getActiveSpreadsheet().getSpreadsheetTimeZone() || Session.getScriptTimeZone();
}

// Sel bertipe tanggal dikembalikan Apps Script sebagai objek Date, dan
// JSON.stringify mengubahnya ke UTC. Untuk sel tanggal (00:00 waktu lokal) itu
// menggeser tanggalnya mundur sehari di zona timur UTC seperti WIB. Karena itu
// tanggal dikirim sebagai teks yang sudah diformat di zona waktu spreadsheet.
function serializeCell(header, value) {
    if (!(value instanceof Date)) return value;

    var tz = sheetTimeZone();
    if (header === 'Tanggal') return Utilities.formatDate(value, tz, 'yyyy-MM-dd');
    return Utilities.formatDate(value, tz, "yyyy-MM-dd'T'HH:mm:ss");
}

// ID di Sheet bisa terbaca sebagai angka kalau isinya numerik, jadi
// perbandingannya selalu lewat String().
function findRowById(sheet, id) {
    var target = String(id);
    var ids = sheet.getRange(1, 1, Math.max(sheet.getLastRow(), 1), 1).getValues();

    for (var i = 1; i < ids.length; i++) {
        if (String(ids[i][0]) === target) return i + 1;
    }
    return -1;
}

function generateUUID() {
    return Utilities.getUuid();
}

function buildResponse(responseObject) {
    responseObject.apiVersion = API_VERSION;
    return ContentService.createTextOutput(JSON.stringify(responseObject))
        .setMimeType(ContentService.MimeType.JSON);
}

// Menyusun baris berdasarkan JUDUL kolom, bukan urutan hardcoded.
// Backend versi pertama menulis 7 nilai ke sheet berkolom 8 sehingga "Dibuat Pada"
// mendarat di kolom Dompet dan sumber dana hilang. Dengan pemetaan lewat header,
// pergeseran kolom seperti itu tidak mungkin terjadi lagi — termasuk kalau kolom
// di spreadsheet ditambah atau diurut ulang.
function rowFromObject(sheet, values) {
    var lastCol = sheet.getLastColumn();
    var headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];

    return headers.map(function (header) {
        var key = String(header).trim();
        return values.hasOwnProperty(key) ? values[key] : '';
    });
}
