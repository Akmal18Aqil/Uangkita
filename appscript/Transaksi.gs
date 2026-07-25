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
    
    // Read dompet/wallet from any possible property name the frontend might send
    var dompet = payload.dompet || payload.Dompet || payload.wallet || payload.Wallet 
                 || payload.sumberDana || payload.sumber_dana || payload.SumberDana 
                 || payload.sumber || payload.Sumber || payload.akun || payload.Akun 
                 || payload.account || payload.Account || 'Tunai';
    
    // Ensure catatan is never empty to prevent column shifting
    var catatan = payload.catatan || payload.Catatan || '-';
    
    // Columns: ID, Tanggal, Tipe, Kategori, Jumlah, Catatan, Dompet, Dibuat Pada
    var newRow = [
        newId,
        payload.tanggal || payload.Tanggal || new Date().toISOString().split('T')[0],
        payload.tipe || payload.Tipe || 'Pengeluaran',
        payload.kategori || payload.Kategori || 'Lainnya',
        payload.jumlah || payload.Jumlah || 0,
        catatan,
        dompet,
        timestamp
    ];
    
    sheet.appendRow(newRow);
    
    return { id: newId, timestamp: timestamp };
}

function updateTransaction(payload) {
    const sheet = getSheet('Transaksi');
    const data = sheet.getDataRange().getValues();
    
    var id = payload.id || payload.ID;
    
    for (var i = 1; i < data.length; i++) {
        if (String(data[i][0]) === String(id)) {
            var rowIdx = i + 1;
            var tanggal = payload.tanggal || payload.Tanggal;
            var tipe = payload.tipe || payload.Tipe;
            var kategori = payload.kategori || payload.Kategori;
            var jumlah = payload.jumlah || payload.Jumlah;
            var catatan = payload.catatan || payload.Catatan;
            var dompet = payload.dompet || payload.Dompet || payload.wallet || payload.sumberDana || payload.sumber_dana;
            
            if (tanggal) sheet.getRange(rowIdx, 2).setValue(tanggal);
            if (tipe) sheet.getRange(rowIdx, 3).setValue(tipe);
            if (kategori) sheet.getRange(rowIdx, 4).setValue(kategori);
            if (jumlah) sheet.getRange(rowIdx, 5).setValue(jumlah);
            if (catatan) sheet.getRange(rowIdx, 6).setValue(catatan);
            if (dompet) sheet.getRange(rowIdx, 7).setValue(dompet);
            return { id: id, updated: true };
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
