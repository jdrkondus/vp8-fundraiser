// VP-8 Fighting Tigers Fundraiser — order intake backend.
//
// Setup:
// 1. Go to sheets.google.com and create a new blank spreadsheet
//    (e.g. name it "VP-8 Fundraiser Orders"). This sheet is private —
//    only you (and anyone you explicitly share it with) can see it.
// 2. In the sheet, go to Extensions > Apps Script.
// 3. Delete the boilerplate code and paste this entire file in its place.
// 4. Click Deploy > New deployment > select type "Web app".
//    - Execute as: Me
//    - Who has access: Anyone
// 5. Click Deploy, then authorize the requested permissions (Sheets + Gmail).
// 6. Copy the Web App URL it gives you and paste it into the SCRIPT_URL
//    constant near the top of the <script> block in VP8-Fundraiser.html.

const NOTIFY_EMAIL = 'vp8tsg@gmail.com';
const SHEET_NAME = 'Orders';

function doPost(e) {
  const order = JSON.parse(e.postData.contents);
  const sheet = getOrdersSheet();

  order.items.forEach(function (item) {
    sheet.appendRow([
      new Date(order.submittedAt),
      order.id,
      order.buyerName,
      order.buyerEmail,
      order.buyerPhone,
      order.payment,
      item.name,
      item.color,
      item.size,
      item.qty,
      item.unitPrice,
      item.qty * item.unitPrice,
      order.total,
      order.notes,
    ]);
  });

  MailApp.sendEmail({
    to: NOTIFY_EMAIL,
    subject: 'New Fundraiser Order — ' + order.buyerName + ' ($' + order.total.toFixed(2) + ')',
    body: buildEmailBody(order),
  });

  // Send confirmation email to customer if email provided
  if (order.buyerEmail) {
    MailApp.sendEmail({
      to: order.buyerEmail,
      subject: 'VP-8 Fighting Tigers Fundraiser Order Confirmation',
      body: buildCustomerEmailBody(order),
    });
  }

  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function getOrdersSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow([
      'Date', 'Order ID', 'Buyer Name', 'Email', 'Phone', 'Payment Method',
      'Item', 'Color', 'Size', 'Qty', 'Unit Price', 'Subtotal', 'Order Total', 'Notes',
    ]);
  }
  return sheet;
}

function buildEmailBody(order) {
  const lines = order.items.map(function (item) {
    return '  ' + item.qty + ' x ' + item.name + ' — ' + item.color + ' / ' + item.size +
      ' — $' + item.unitPrice.toFixed(2) + ' ea = $' + (item.qty * item.unitPrice).toFixed(2);
  }).join('\n');

  return 'VP-8 FIGHTING TIGERS — NEW FUNDRAISER ORDER\n' +
    '----------------------------------------\n' +
    'Buyer: ' + order.buyerName + '\n' +
    'Email: ' + (order.buyerEmail || '(none)') + '\n' +
    'Phone: ' + (order.buyerPhone || '(none)') + '\n' +
    'Payment method: ' + order.payment + '\n\n' +
    'Order:\n' + lines + '\n\n' +
    'TOTAL: $' + order.total.toFixed(2) + '\n\n' +
    'Notes: ' + (order.notes || '(none)');
}

function buildCustomerEmailBody(order) {
  const lines = order.items.map(function (item) {
    return '  ' + item.qty + ' x ' + item.name + ' (' + item.color + ', Size ' + item.size + ')\n' +
      '    $' + item.unitPrice.toFixed(2) + ' x ' + item.qty + ' = $' + (item.qty * item.unitPrice).toFixed(2);
  }).join('\n\n');

  return 'Thank you for your order!\n\n' +
    'Dear ' + order.buyerName + ',\n\n' +
    'Your VP-8 Fighting Tigers fundraiser order has been received and recorded.\n' +
    'Order ID: ' + order.id + '\n\n' +
    '--- ORDER SUMMARY ---\n\n' +
    lines + '\n\n' +
    '--- TOTAL ---\n' +
    '$' + order.total.toFixed(2) + '\n\n' +
    '--- PAYMENT METHOD ---\n' +
    order.payment + '\n\n' +
    (order.notes ? '--- SPECIAL REQUESTS/NOTES ---\n' + order.notes + '\n\n' : '') +
    'Thank you for supporting VP-8 and the Family Support Group!\n\n' +
    'Questions? Please contact the organizer.\n\n' +
    'VP-8 TSG';
}
