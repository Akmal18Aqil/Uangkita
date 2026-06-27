function getTransactions() {
    const sheet = getSheet('Transaksi');
    const data = sheet.getDataRange().getValues();
    
    if (data.length <= 1) return []; // Only headers
    
    const headers = data[0];
    const result = [];
    
    for (let i = 1; i < data.length; i++) {
        let row = data[i];
        if (!row[0]) continue; // Skip empty rows
        
        let obj = {};
        for (let j = 0; j < headers.length; j++) {
            obj[headers[j]] = row[j];
        }
        result.push(obj);
    }
    
    return result;
}

function addTransaction(payload) {
    const sheet = getSheet('Transaksi');
    
    const newId = generateUUID();
    const timestamp = new Date().toISOString();
    
    // Columns: ID, Tanggal, Tipe, Kategori, Jumlah, Catatan, Dibuat Pada
    const newRow = [
        newId,
        payload.tanggal || new Date().toISOString().split('T')[0],
        payload.tipe || 'Pengeluaran',
        payload.kategori || 'Lainnya',
        payload.jumlah || 0,
        payload.catatan || '',
        timestamp
    ];
    
    sheet.appendRow(newRow);
    
    return { id: newId, timestamp: timestamp };
}

function updateTransaction(payload) {
    const sheet = getSheet('Transaksi');
    const data = sheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
        if (data[i][0] === payload.id) {
            // Update row (1-indexed for sheet ranges)
            const rowIdx = i + 1;
            if (payload.tanggal) sheet.getRange(rowIdx, 2).setValue(payload.tanggal);
            if (payload.tipe) sheet.getRange(rowIdx, 3).setValue(payload.tipe);
            if (payload.kategori) sheet.getRange(rowIdx, 4).setValue(payload.kategori);
            if (payload.jumlah) sheet.getRange(rowIdx, 5).setValue(payload.jumlah);
            if (payload.catatan) sheet.getRange(rowIdx, 6).setValue(payload.catatan);
            return { id: payload.id, updated: true };
        }
    }
    
    throw new Error('Transaction not found');
}

function deleteTransaction(id) {
    const sheet = getSheet('Transaksi');
    const data = sheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
        if (data[i][0] === id) {
            sheet.deleteRow(i + 1);
            return { id: id, deleted: true };
        }
    }
    
    throw new Error('Transaction not found');
}
