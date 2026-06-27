function getSheet(sheetName) {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(sheetName);
    
    // Auto create sheet if doesn't exist
    if (!sheet) {
        sheet = ss.insertSheet(sheetName);
        if (sheetName === 'Transaksi') {
            sheet.appendRow(['ID', 'Tanggal', 'Tipe', 'Kategori', 'Jumlah', 'Catatan', 'Dibuat Pada']);
        } else if (sheetName === 'Tasks') {
            sheet.appendRow(['ID', 'Judul', 'Deskripsi', 'Prioritas', 'Status', 'Deadline', 'Kategori', 'CalendarEventId', 'Dibuat Pada']);
        }
    }
    
    return sheet;
}

function generateUUID() {
    return Utilities.getUuid();
}

function buildResponse(responseObject) {
    return ContentService.createTextOutput(JSON.stringify(responseObject))
        .setMimeType(ContentService.MimeType.JSON);
}
