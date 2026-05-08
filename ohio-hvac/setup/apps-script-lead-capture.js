// Ohio HVAC Pros — Lead Capture Webhook
// Deploy as: Web App | Execute as: Me | Who has access: Anyone
// Then paste the deployment URL into ohio-hvac/js/form-handler.js

var SHEET_ID = '1CsPn9h8PxBujt4ByMBlgBWGbeRRzC2YEUcZ7_XJGVsw';
var NOTIFY_EMAIL = 'cameron@cmeholdings.co';

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.openById(SHEET_ID);
    var tabName = 'Ohio HVAC Leads';
    var sheet = ss.getSheetByName(tabName);
    if (!sheet) {
      sheet = ss.insertSheet(tabName);
      var headers = ['Timestamp','Full Name','Phone Number','Email','City',
                     'Service Needed','Additional Details','Source Page URL','Lead Status'];
      sheet.appendRow(headers);
      sheet.getRange(1,1,1,headers.length)
           .setFontWeight('bold')
           .setBackground('#1a3a52')
           .setFontColor('#ffffff');
      sheet.setFrozenRows(1);
    }
    var ts = new Date().toLocaleString('en-US', {timeZone: 'America/New_York'});
    sheet.appendRow([ts, data.name||'', data.phone||'', data.email||'',
                     data.city||'', data.service||'', data.details||'',
                     data.pageUrl||'', 'New']);

    var subj = 'New OHIO HVAC PRO Lead — ' + (data.city||'') + ' — ' + (data.service||'');
    var body = [
      'NEW LEAD — Ohio HVAC Pros', '',
      'Full Name:   ' + (data.name||''),
      'Phone:       ' + (data.phone||''),
      'Email:       ' + (data.email||''),
      'City:        ' + (data.city||''),
      'Service:     ' + (data.service||''),
      'Details:     ' + (data.details||''),
      '',
      'Timestamp:   ' + ts,
      'Source URL:  ' + (data.pageUrl||''),
      '',
      '-- Ohio HVAC Pros Lead Capture System'
    ].join('\n');
    MailApp.sendEmail(NOTIFY_EMAIL, subj, body);

    return ContentService
      .createTextOutput(JSON.stringify({success:true}))
      .setMimeType(ContentService.MimeType.JSON);
  } catch(err) {
    Logger.log(err);
    return ContentService
      .createTextOutput(JSON.stringify({success:false, error:err.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput('Ohio HVAC Pros Lead Capture — Active');
}
