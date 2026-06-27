function doGet(e) {
    const action = e.parameter.action;
    
    try {
        let data = null;
        switch(action) {
            case 'getTransactions':
                data = getTransactions();
                break;
            case 'getTasks':
                data = getTasks();
                break;
            case 'getCalendarEvents':
                data = getCalendarEvents();
                break;
            case 'getCategories':
                data = getCategories();
                break;
            default:
                throw new Error('Action not found');
        }
        return buildResponse({ status: 'success', data: data });
    } catch (error) {
        return buildResponse({ status: 'error', message: error.message });
    }
}

function doPost(e) {
    let payload;
    try {
        payload = JSON.parse(e.postData.contents);
    } catch (err) {
        return buildResponse({ status: 'error', message: 'Invalid JSON payload' });
    }
    
    const action = e.parameter.action;
    
    try {
        let result = null;
        switch(action) {
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
                result = deleteTask(payload.id);
                break;
            default:
                throw new Error('Action not found');
        }
        return buildResponse({ status: 'success', data: result });
    } catch (error) {
        return buildResponse({ status: 'error', message: error.message });
    }
}

function doOptions(e) {
    return buildResponse({ status: 'success' });
}
