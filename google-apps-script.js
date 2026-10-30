/**
 * ============================================================================
 * BAKERY FRANCHISE INDIA - GOOGLE APPS SCRIPT LEAD DATABASE & GMAIL ALERTS
 * ============================================================================
 *
 * HOW TO SET THIS UP (Takes 2 minutes):
 * 1. Open Google Sheets (https://sheets.google.com) and create a new blank spreadsheet.
 * 2. Rename the spreadsheet to "Bakery Franchise Leads".
 * 3. In the menu, click "Extensions" > "Apps Script".
 * 4. Delete any code inside Code.gs and paste this ENTIRE file into it.
 * 5. Update RECIPIENT_EMAILS below with your client's Gmail address (e.g. ['client@gmail.com']).
 * 6. Click "Save" (disk icon).
 * 7. Click "Deploy" (blue button top right) > "New deployment".
 * 8. Click the Gear icon (Select type) > Choose "Web app".
 * 9. Set:
 *    - Description: "Bakery Franchise Lead Webhook"
 *    - Execute as: "Me" (your Google account)
 *    - Who has access: "Anyone"  <-- CRITICAL! Must be "Anyone" so the website can submit.
 * 10. Click "Deploy" and authorize access when prompted.
 * 11. Copy the "Web app URL" (ends in /exec) and paste it into window.APP_CONFIG.leadWebhookUrl in script.js.
 * ============================================================================
 */

// CONFIGURATION: Enter your recipient email(s) here
var RECIPIENT_EMAILS = [
  "info@bakeryfranchisepartner.in" // Change or add more emails: ["email1@gmail.com", "email2@gmail.com"]
];

var SHEET_NAME = "Leads"; // Name of the sheet tab inside Google Sheets

/**
 * Handle incoming POST requests from the website form
 */
function doPost(e) {
  var lock = LockService.getScriptLock();
  // Prevent concurrent write collisions
  lock.tryLock(10000);

  try {
    var rawData = e.postData ? e.postData.contents : "{}";
    var data = {};

    try {
      data = JSON.parse(rawData);
    } catch (parseErr) {
      data = e.parameter || {};
    }

    var sheet = getOrCreateSheet();

    // Format IST Date & Time
    var now = new Date();
    var formattedDate = Utilities.formatDate(now, "Asia/Kolkata", "dd MMM yyyy, hh:mm:ss a") + " (IST)";

    var fullName = data.fullName || data.full_name || "-";
    var mobileNumber = data.mobileNumber || data.mobile_number || "-";
    var city = data.city || "-";
    var preferredLocation = data.preferredLocation || data.preferred_location || city;
    var investmentBudget = formatBudget(data.investmentBudget || data.investment_budget || "-");
    var message = data.message || "None provided";
    var landingPageUrl = data.landingPageUrl || "-";
    var referrer = data.referrer || "direct";

    // 1. Append Row to Google Sheet Database
    sheet.appendRow([
      formattedDate,
      fullName,
      "'" + mobileNumber, // Leading quote preserves number formatting
      city,
      preferredLocation,
      investmentBudget,
      message,
      landingPageUrl,
      referrer
    ]);

    // 2. Send Instant Email Alert via Gmail
    sendEmailNotification({
      date: formattedDate,
      fullName: fullName,
      mobileNumber: mobileNumber,
      city: city,
      preferredLocation: preferredLocation,
      investmentBudget: investmentBudget,
      message: message,
      landingPageUrl: landingPageUrl
    });

    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Lead recorded and notification sent successfully."
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);

  } finally {
    lock.releaseLock();
  }
}

/**
 * Helper to handle GET request (for testing deployment in browser)
 */
function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: "active",
    message: "Bakery Franchise Lead Webhook is running and ready to receive submissions."
  })).setMimeType(ContentService.MimeType.JSON);
}

/**
 * Helper to get or create sheet with headers
 */
function getOrCreateSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }

  // If first row is empty, add formatted headers
  if (sheet.getLastRow() === 0) {
    var headers = [
      "Submission Date & Time (IST)",
      "Full Name",
      "Mobile Number",
      "City",
      "Preferred Location",
      "Investment Budget",
      "Requirement / Message",
      "Landing Page URL",
      "Traffic Referrer"
    ];
    var headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setValues([headers]);
    headerRange.setBackground("#2c1810");
    headerRange.setFontColor("#ffffff");
    headerRange.setFontWeight("bold");
    sheet.setFrozenRows(1);

    // Auto fit column widths
    for (var i = 1; i <= headers.length; i++) {
      sheet.setColumnWidth(i, 180);
    }
  }

  return sheet;
}

/**
 * Format investment budget values into human-readable text
 */
function formatBudget(val) {
  var map = {
    "5_10_lakhs": "₹5 Lakhs - ₹10 Lakhs",
    "10_15_lakhs": "₹10 Lakhs - ₹15 Lakhs",
    "15_25_lakhs": "₹15 Lakhs - ₹25 Lakhs",
    "above_25_lakhs": "Above ₹25 Lakhs",
    "to_be_discussed": "To be discussed"
  };
  return map[val] || val;
}

/**
 * Send Instant Lead Notification Email via Gmail
 */
function sendEmailNotification(lead) {
  if (!RECIPIENT_EMAILS || RECIPIENT_EMAILS.length === 0) return;

  var recipients = RECIPIENT_EMAILS.join(",");
  var subject = "🚨 New Franchise Enquiry: " + lead.fullName + " (" + lead.city + ") - " + lead.investmentBudget;

  var cleanPhone = lead.mobileNumber.toString().replace(/[^0-9]/g, "");
  var waLink = "https://wa.me/91" + (cleanPhone.length === 10 ? cleanPhone : cleanPhone.slice(-10));
  var telLink = "tel:+91" + (cleanPhone.length === 10 ? cleanPhone : cleanPhone.slice(-10));

  var htmlBody = ""
    + "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0d0c1; border-radius: 8px; overflow: hidden; background-color: #ffffff;'>"
    + "  <div style='background: linear-gradient(135deg, #4A154B 0%, #D81B60 100%); color: #ffffff; padding: 24px 20px; text-align: center;'>"
    + "    <h1 style='margin: 0; font-size: 22px; font-weight: bold; color: #ffffff;'>🎂 Bakery Franchise Partner</h1>"
    + "    <p style='margin: 6px 0 0; font-size: 14px; color: #fce4ec;'>New Monginis Cake Shop Franchise Lead Received</p>"
    + "  </div>"
    + "  <div style='padding: 24px 20px; color: #333333;'>"
    + "    <p style='font-size: 15px; margin-top: 0;'>A new prospective franchise partner just submitted an enquiry form:</p>"
    + "    <table style='width: 100%; border-collapse: collapse; margin: 18px 0; font-size: 14px;'>"
    + "      <tr style='background-color: #fbf7f4;'><td style='padding: 10px 14px; font-weight: bold; width: 38%; border: 1px solid #ecd8c9;'>Full Name</td><td style='padding: 10px 14px; border: 1px solid #ecd8c9; font-weight: 600; color: #2c1810;'>" + lead.fullName + "</td></tr>"
    + "      <tr><td style='padding: 10px 14px; font-weight: bold; border: 1px solid #ecd8c9;'>Mobile Number</td><td style='padding: 10px 14px; border: 1px solid #ecd8c9; font-size: 16px; font-weight: bold; color: #c45a27;'><a href='" + telLink + "' style='color: #c45a27; text-decoration: none;'>+91 " + lead.mobileNumber + "</a></td></tr>"
    + "      <tr style='background-color: #fbf7f4;'><td style='padding: 10px 14px; font-weight: bold; border: 1px solid #ecd8c9;'>City / Location</td><td style='padding: 10px 14px; border: 1px solid #ecd8c9;'>" + lead.city + (lead.preferredLocation && lead.preferredLocation !== lead.city ? " (" + lead.preferredLocation + ")" : "") + "</td></tr>"
    + "      <tr><td style='padding: 10px 14px; font-weight: bold; border: 1px solid #ecd8c9;'>Investment Budget</td><td style='padding: 10px 14px; border: 1px solid #ecd8c9; font-weight: bold; color: #2e7d32;'>" + lead.investmentBudget + "</td></tr>"
    + "      <tr style='background-color: #fbf7f4;'><td style='padding: 10px 14px; font-weight: bold; border: 1px solid #ecd8c9;'>Requirement / Notes</td><td style='padding: 10px 14px; border: 1px solid #ecd8c9;'>" + lead.message + "</td></tr>"
    + "      <tr><td style='padding: 10px 14px; font-weight: bold; border: 1px solid #ecd8c9;'>Received At</td><td style='padding: 10px 14px; border: 1px solid #ecd8c9; color: #666666;'>" + lead.date + "</td></tr>"
    + "    </table>"
    + "    <div style='text-align: center; margin-top: 24px; padding-top: 18px; border-top: 1px dashed #e0d0c1;'>"
    + "      <a href='" + telLink + "' style='display: inline-block; background-color: #4A154B; color: #ffffff; padding: 12px 22px; margin: 4px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 14px;'>📞 Call Candidate Now</a>"
    + "      <a href='" + waLink + "' style='display: inline-block; background-color: #25D366; color: #ffffff; padding: 12px 22px; margin: 4px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 14px;'>💬 Chat on WhatsApp</a>"
    + "    </div>"
    + "  </div>"
    + "  <div style='background-color: #f8f3ee; padding: 12px 20px; font-size: 12px; color: #7a6e65; text-align: center; border-top: 1px solid #ecd8c9;'>"
    + "    This is an automated notification from your website lead form at Bakery Franchise Partner (bakeryfranchisepartner.in/monginis-cakes/)."
    + "  </div>"
    + "</div>";

  MailApp.sendEmail({
    to: recipients,
    subject: subject,
    htmlBody: htmlBody
  });
}
