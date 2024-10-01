const sheetName = "conversation";

function doGet(e) {
  return ContentService.createTextOutput("成功");
}

function doPost(e) {
  var jsonData = JSON.parse(e.postData.contents);
  var name = jsonData.name;
  var input = jsonData.input;

  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);

  if (!sheet) {
    return ContentService.createTextOutput("Sheet not found.").setMimeType(ContentService.MimeType.TEXT);
  }

  var lastRow = sheet.getLastRow();

  sheet.getRange(lastRow + 1, 1).setValue(name);
  sheet.getRange(lastRow + 1, 2).setValue(input);

  if (name !== "interviewer") {
    const response = writeResponse(input);

    const jsonResponse = {
      response: response
    };

    return ContentService.createTextOutput(JSON.stringify(jsonResponse))
      .setMimeType(ContentService.MimeType.JSON);
  } else {
    return ContentService.createTextOutput(JSON.stringify([]))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
