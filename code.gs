function isSameDate(dateToCheck, actualDate){
  var isSameDay = (dateToCheck.getDate() == actualDate.getDate() 
        && dateToCheck.getMonth() == actualDate.getMonth()
        && dateToCheck.getFullYear() == actualDate.getFullYear())
        
  return isSameDay;
}

function resetCache(){
  var cache = CacheService.getScriptCache();
  cache.put('lastHour', null);
  cache.put('lastStatus', null);
}

function updateStatus(status) {
  
  // Filter status
  status = (status * 1 ? '1' : '0');
  
  // Get current time
  var hour = (new Date()).getHours();
  
  // Verify from cache if:
  // + last value is different from current
  // + last hour is different from current hour
  var cache = CacheService.getScriptCache();
  var lastHour = cache.get('lastHour');
  var lastStatus = cache.get('lastStatus');
  
  if(lastStatus === status && lastHour === hour){
    Logger.log('Skipping. It`s the same...');
    return lastStatus;
  }
  
  // Update cache with current state
  cache.put('lastHour', hour);
  cache.put('lastStatus', status);
  
  // Push notification if state differ
  if(lastStatus !== status){
    UrlFetchApp.fetch('link + status here'+status);
  }
  
  // Open spreadsheet
  var id = 'put your Id Here';
  var spreadsheet = SpreadsheetApp.openById(id);
  var sheet = spreadsheet.getSheetByName('Logs');
  
  // First, find out the current line (date)
  var rows = sheet.getLastRow();
  
  // Get current date, verify if it's a new day
  var cell = sheet.getRange(rows, 1);
  
  // Create the date object from the cell value
  var dateCheck = cell.getValue();
  dateCheck.setHours(0, 0, 0, 0);

  // Today object  
  var today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if(+dateCheck != +today){
    // Create a new row...
    //sheet.insertRowAfter(rows);
    rows++;
    // Set current date
    cell = sheet.getRange(rows, 1);
    cell.setValue(today);
  }
  
  // Set current cell value
  var currentCell = sheet.getRange(rows, 2 + hour);
  var currentCellValue = currentCell.getValue();
  // Verify if cell value is different
  if(currentCellValue !== status && currentCellValue != '1'){
    currentCell.setValue(status);
  }
  
  return status;
}

function doGet(e){
  var startTime = Date.now();
  var params = JSON.stringify(e);
  
  // Update sheet
  var value = e.parameter.sensor;
  var currentStatus = updateStatus(value);
  
  Logger.log('Took: '+(Date.now() - startTime)+' ms');
  return HtmlService.createHtmlOutput('Current status is: ' + currentStatus);
  
}
