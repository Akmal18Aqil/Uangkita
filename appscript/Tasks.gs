function getTasks() {
    const sheet = getSheet('Tasks');
    const data = sheet.getDataRange().getValues();
    
    if (data.length <= 1) return [];
    
    const headers = data[0];
    const result = [];
    
    for (let i = 1; i < data.length; i++) {
        let row = data[i];
        if (!row[0]) continue;
        
        let obj = {};
        for (let j = 0; j < headers.length; j++) {
            obj[headers[j]] = row[j];
        }
        result.push(obj);
    }
    
    return result;
}

function addTask(payload) {
    const sheet = getSheet('Tasks');
    const newId = generateUUID();
    const timestamp = new Date().toISOString();
    
    let eventId = '';
    
    if (payload.syncCalendar && payload.deadline) {
        try {
            const calendar = CalendarApp.getDefaultCalendar();
            const date = new Date(payload.deadline);
            const event = calendar.createEvent(payload.judul, date, new Date(date.getTime() + 60*60*1000));
            event.setDescription(payload.deskripsi || '');
            
            // Pengingat sesuai request: H-2 hari, H-24 jam, H-12 jam, H-5 jam
            event.addPopupReminder(2880); // 48 jam (2 hari)
            event.addPopupReminder(1440); // 24 jam
            event.addPopupReminder(720);  // 12 jam
            event.addPopupReminder(300);  // 5 jam
            
            eventId = event.getId();
        } catch (e) {
            console.error('Failed to create calendar event', e);
        }
    }
    
    const newRow = [
        newId,
        payload.judul || '',
        payload.deskripsi || '',
        payload.prioritas || 'Medium',
        payload.status || 'Todo',
        payload.deadline || '',
        payload.kategori || 'Personal',
        eventId,
        timestamp
    ];
    
    sheet.appendRow(newRow);
    
    return { id: newId, eventId: eventId, timestamp: timestamp };
}

function updateTask(payload) {
    const sheet = getSheet('Tasks');
    const data = sheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
        if (data[i][0] === payload.id) {
            const rowIdx = i + 1;
            let eventId = data[i][7];
            
            if (payload.syncCalendar && payload.deadline) {
                try {
                    const calendar = CalendarApp.getDefaultCalendar();
                    const date = new Date(payload.deadline);
                    if (eventId) {
                        const event = calendar.getEventById(eventId);
                        if (event) {
                            event.setTitle(payload.judul);
                            event.setDescription(payload.deskripsi || '');
                            event.setTime(date, new Date(date.getTime() + 60*60*1000));
                        } else {
                            const newEvent = calendar.createEvent(payload.judul, date, new Date(date.getTime() + 60*60*1000));
                            newEvent.addPopupReminder(2880);
                            newEvent.addPopupReminder(1440);
                            newEvent.addPopupReminder(720);
                            newEvent.addPopupReminder(300);
                            eventId = newEvent.getId();
                        }
                    } else {
                        const newEvent = calendar.createEvent(payload.judul, date, new Date(date.getTime() + 60*60*1000));
                        newEvent.addPopupReminder(2880);
                        newEvent.addPopupReminder(1440);
                        newEvent.addPopupReminder(720);
                        newEvent.addPopupReminder(300);
                        eventId = newEvent.getId();
                    }
                } catch(e) {}
            } else if (eventId && payload.status === 'Done') {
                try {
                    const calendar = CalendarApp.getDefaultCalendar();
                    const event = calendar.getEventById(eventId);
                    if (event) event.setTitle('✅ ' + payload.judul);
                } catch(e) {}
            }
            
            if (payload.judul !== undefined) sheet.getRange(rowIdx, 2).setValue(payload.judul);
            if (payload.deskripsi !== undefined) sheet.getRange(rowIdx, 3).setValue(payload.deskripsi);
            if (payload.prioritas !== undefined) sheet.getRange(rowIdx, 4).setValue(payload.prioritas);
            if (payload.status !== undefined) sheet.getRange(rowIdx, 5).setValue(payload.status);
            if (payload.deadline !== undefined) sheet.getRange(rowIdx, 6).setValue(payload.deadline);
            if (payload.kategori !== undefined) sheet.getRange(rowIdx, 7).setValue(payload.kategori);
            sheet.getRange(rowIdx, 8).setValue(eventId);
            
            return { id: payload.id, updated: true, eventId: eventId };
        }
    }
    throw new Error('Task not found');
}

function deleteTask(id) {
    const sheet = getSheet('Tasks');
    const data = sheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
        if (data[i][0] === id) {
            const eventId = data[i][7];
            if (eventId) {
                try {
                    const calendar = CalendarApp.getDefaultCalendar();
                    const event = calendar.getEventById(eventId);
                    if (event) event.deleteEvent();
                } catch (e) {}
            }
            sheet.deleteRow(i + 1);
            return { id: id, deleted: true };
        }
    }
    throw new Error('Task not found');
}

function getCalendarEvents() {
    try {
        const cal = CalendarApp.getDefaultCalendar();
        const now = new Date();
        const nextMonth = new Date();
        nextMonth.setMonth(now.getMonth() + 1);
        
        const events = cal.getEvents(now, nextMonth);
        const result = [];
        
        for (let i = 0; i < events.length; i++) {
            result.push({
                id: events[i].getId(),
                title: events[i].getTitle(),
                start: events[i].getStartTime().toISOString(),
                end: events[i].getEndTime().toISOString(),
                desc: events[i].getDescription()
            });
        }
        return result;
    } catch (e) {
        return [];
    }
}

function testCalendar() {
    const cal = CalendarApp.getDefaultCalendar();
    Logger.log("Berhasil menghubungkan ke kalender: " + cal.getName());
}
