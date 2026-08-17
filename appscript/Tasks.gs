// Kolom: ID, Judul, Deskripsi, Prioritas, Status, Deadline, Kategori, CalendarEventId, Dibuat Pada
var TCOL = { ID: 1, JUDUL: 2, DESKRIPSI: 3, PRIORITAS: 4, STATUS: 5, DEADLINE: 6, KATEGORI: 7, EVENT: 8, DIBUAT: 9 };

// Pengingat: H-2 hari, H-24 jam, H-12 jam, H-5 jam.
var REMINDER_MINUTES = [2880, 1440, 720, 300];

function getTasks() {
    var sheet = getSheet('Tasks');
    var data = sheet.getDataRange().getValues();

    if (data.length <= 1) return [];

    var headers = data[0];
    var result = [];

    // Membaca data tidak boleh mengubah data. Versi sebelumnya menghapus tugas
    // "Done" yang lewat 2 hari di sini, jadi satu GET biasa bisa menghilangkan
    // riwayat tugas secara permanen tanpa konfirmasi.
    for (var i = 1; i < data.length; i++) {
        if (!data[i][0]) continue;

        var obj = {};
        for (var j = 0; j < headers.length; j++) {
            obj[headers[j]] = serializeCell(headers[j], data[i][j]);
        }
        result.push(obj);
    }

    return result;
}

function addTask(payload) {
    var sheet = getSheet('Tasks');
    var newId = String(payload.id || generateUUID());

    if (findRowById(sheet, newId) > 0) return { id: newId, duplicate: true };

    var eventId = '';
    if (payload.syncCalendar && payload.deadline) {
        eventId = upsertCalendarEvent('', payload.judul, payload.deskripsi, payload.deadline);
    }

    sheet.appendRow([
        newId,
        payload.judul || '',
        payload.deskripsi || '',
        payload.prioritas || 'Medium',
        payload.status || 'Todo',
        payload.deadline || '',
        payload.kategori || 'Personal',
        eventId,
        new Date().toISOString()
    ]);

    return { id: newId, eventId: eventId, timestamp: new Date().toISOString() };
}

function updateTask(payload) {
    var sheet = getSheet('Tasks');
    var rowIdx = findRowById(sheet, payload.id);
    if (rowIdx < 1) throw new Error('Task not found');

    var row = sheet.getRange(rowIdx, 1, 1, TCOL.DIBUAT).getValues()[0];
    var eventId = row[TCOL.EVENT - 1];

    var title = payload.judul !== undefined ? payload.judul : row[TCOL.JUDUL - 1];
    var desc = payload.deskripsi !== undefined ? payload.deskripsi : row[TCOL.DESKRIPSI - 1];
    var deadline = payload.deadline !== undefined ? payload.deadline : row[TCOL.DEADLINE - 1];
    var status = payload.status !== undefined ? payload.status : row[TCOL.STATUS - 1];

    if (payload.syncCalendar && deadline) {
        eventId = upsertCalendarEvent(eventId, title, desc, deadline);
    }
    if (eventId) markCalendarDone(eventId, title, status === 'Done');

    if (payload.judul !== undefined) sheet.getRange(rowIdx, TCOL.JUDUL).setValue(payload.judul);
    if (payload.deskripsi !== undefined) sheet.getRange(rowIdx, TCOL.DESKRIPSI).setValue(payload.deskripsi);
    if (payload.prioritas !== undefined) sheet.getRange(rowIdx, TCOL.PRIORITAS).setValue(payload.prioritas);
    if (payload.status !== undefined) sheet.getRange(rowIdx, TCOL.STATUS).setValue(payload.status);
    if (payload.deadline !== undefined) sheet.getRange(rowIdx, TCOL.DEADLINE).setValue(payload.deadline);
    if (payload.kategori !== undefined) sheet.getRange(rowIdx, TCOL.KATEGORI).setValue(payload.kategori);
    sheet.getRange(rowIdx, TCOL.EVENT).setValue(eventId);

    return { id: payload.id, updated: true, eventId: eventId };
}

function deleteTask(id, keepCalendar) {
    var sheet = getSheet('Tasks');
    var rowIdx = findRowById(sheet, id);
    if (rowIdx < 1) return { id: id, deleted: false, missing: true };

    var eventId = sheet.getRange(rowIdx, TCOL.EVENT).getValue();
    if (eventId && !keepCalendar) {
        try {
            var event = CalendarApp.getDefaultCalendar().getEventById(eventId);
            if (event) event.deleteEvent();
        } catch (e) {
            console.error('Gagal menghapus event kalender', e);
        }
    }

    sheet.deleteRow(rowIdx);
    return { id: id, deleted: true };
}

function getCalendarEvents() {
    try {
        var cal = CalendarApp.getDefaultCalendar();
        var now = new Date();
        var nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());

        return cal.getEvents(now, nextMonth).map(function (event) {
            return {
                id: event.getId(),
                title: event.getTitle(),
                start: event.getStartTime().toISOString(),
                end: event.getEndTime().toISOString(),
                desc: event.getDescription()
            };
        });
    } catch (e) {
        console.error('Gagal membaca kalender', e);
        return [];
    }
}

// Satu jalur untuk membuat/memperbarui event, dipakai addTask dan updateTask.
function upsertCalendarEvent(eventId, title, desc, deadline) {
    try {
        var calendar = CalendarApp.getDefaultCalendar();
        var start = new Date(deadline);
        if (isNaN(start.getTime())) return eventId || '';
        var end = new Date(start.getTime() + 60 * 60 * 1000);

        if (eventId) {
            var existing = calendar.getEventById(eventId);
            if (existing) {
                existing.setTitle(title);
                existing.setDescription(desc || '');
                existing.setTime(start, end);
                return eventId;
            }
        }

        var event = calendar.createEvent(title, start, end);
        event.setDescription(desc || '');
        REMINDER_MINUTES.forEach(function (minutes) { event.addPopupReminder(minutes); });
        return event.getId();
    } catch (e) {
        console.error('Gagal menyinkronkan kalender', e);
        return eventId || '';
    }
}

function markCalendarDone(eventId, title, isDone) {
    try {
        var event = CalendarApp.getDefaultCalendar().getEventById(eventId);
        if (!event) return;
        var cleanTitle = String(title).indexOf('✅ ') === 0 ? String(title).slice(2) : String(title);
        event.setTitle(isDone ? '✅ ' + cleanTitle : cleanTitle);
    } catch (e) {
        console.error('Gagal menandai event kalender', e);
    }
}

function testCalendar() {
    Logger.log('Berhasil menghubungkan ke kalender: ' + CalendarApp.getDefaultCalendar().getName());
}
