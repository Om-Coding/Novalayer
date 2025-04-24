// --- CONSTANTS ---
const SPREADSHEET_ID = "1xaUdq6lXVzq-AiTTy0KczYCABWeSgrajuS27WjYM0as";
const DATA_SHEET     = "PrinterOrders";

/**
 * Serves the HTML
 */
function doGet() {
  return HtmlService
    .createHtmlOutputFromFile('Index')
    .setTitle('Printer Orders');
}

/**
 * Only create (append) a new record.
 * Called from the client via google.script.run.processForm(...)
 */
function processForm(formObject) {
  // Build the row array
  const row = [
    Utilities.getUuid(),                        // unique ID
    formObject.name || '',
    formObject.description || '',
    formObject.category || '',
    formObject.countryOfOrigin || '',
    formObject.condition || '',
    formObject.price  || '',
    formObject.quantity || '',
    new Date().toLocaleString()
  ];
  
  // Append to sheet
  const ss    = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(DATA_SHEET);
  sheet.appendRow(row);
  
  // Return a simple success marker
  return 'OK';
}
