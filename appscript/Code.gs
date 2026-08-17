function doGet(e) {
    var action = e.parameter.action;

    try {
        var data = null;
        switch (action) {
            case 'getTransactions':
                data = getTransactions();
                break;
            case 'getTasks':
                data = getTasks();
                break;
            case 'getCalendarEvents':
                data = getCalendarEvents();
                break;
            default:
                throw new Error('Action not found: ' + action);
        }
        return buildResponse({ status: 'success', data: data });
    } catch (error) {
        return buildResponse({ status: 'error', message: error.message });
    }
}

function doPost(e) {
    var payload;
    try {
        payload = JSON.parse(e.postData.contents);
    } catch (err) {
        return buildResponse({ status: 'error', message: 'Invalid JSON payload' });
    }

    var action = e.parameter.action;

    // Aplikasi ini juga dipakai dari HP + antrean offline yang dikirim beruntun,
    // jadi dua penulisan bisa datang bersamaan. Tanpa kunci, appendRow dan
    // deleteRow bisa saling menimpa baris.
    var lock = LockService.getScriptLock();
    try {
        lock.waitLock(20000);
    } catch (err) {
        return buildResponse({ status: 'error', message: 'Server sedang sibuk, coba lagi.' });
    }

    try {
        var result = null;
        switch (action) {
            case 'addTransaction':
                result = addTransaction(payload);
                break;
            case 'updateTransaction':
                result = updateTransaction(payload);
                break;
            case 'deleteTransaction':
                result = deleteTransaction(payload.id);
                break;
            case 'addTask':
                result = addTask(payload);
                break;
            case 'updateTask':
                result = updateTask(payload);
                break;
            case 'deleteTask':
                result = deleteTask(payload.id, payload.keepCalendar);
                break;
            default:
                throw new Error('Action not found: ' + action);
        }
        return buildResponse({ status: 'success', data: result });
    } catch (error) {
        return buildResponse({ status: 'error', message: error.message });
    } finally {
        lock.releaseLock();
    }
}
