/**
 * ============================================================================
 * BAKERY FRANCHISE INDIA - JAVASCRIPT & TRACKING INTEGRATION
 * Website: https://bakeryfranchiseindia.shop/
 * ============================================================================
 */

(function () {
  'use strict';

  // ==========================================================================
  // CLIENT & TRACKING CONFIGURATION (Easily replace values here)
  // ==========================================================================
  window.APP_CONFIG = {
    // Business Contact Details (Replace placeholders when available)
    businessName: "Bakery Franchise India",
    phoneNumberDisplay: "+91 95195 54714",
    phoneNumberTel: "+919519554714",
    whatsappNumber: "919519554714",
    whatsappPreFilledMsg: "Hello, I am interested in a bakery franchise opportunity. I would like more information.",
    emailAddress: "info@bakeryfranchiseindia.shop",
    officeAddress: "C-1034, Opposite Bhootnath Market, A Block, Indira Nagar, Lucknow - 226016",
    operatingHours: "Mon - Sat: 10:00 AM - 7:00 PM IST",

    // Google Ads & Analytics Tracking Configuration
    googleAdsId: "AW-18435726150",
    gtmId: "GTM-P94VCCMQ",
    conversionLabels: {
      formSubmission: "YOUR_CONVERSION_LABEL_FORM",
      phoneCallClick: "YOUR_CONVERSION_LABEL_PHONE",
      whatsappClick: "YOUR_CONVERSION_LABEL_WHATSAPP"
    },

    // Google Sheets & Gmail Webhook URL (Paste your Google Apps Script Web App URL here)
    leadWebhookUrl: "https://script.google.com/macros/s/AKfycbwQMKkPTRaWlLdGTVkD8uZsJFg5iizaj7F-sYciETx4B7-X4a1f2fVfyP5Jdy78xLThvw/exec"
  };

  // ==========================================================================
  // CONVERSION EVENT TRACKING WRAPPER
  // ==========================================================================
  function trackConversion(actionType, additionalDetails) {
    var details = additionalDetails || {};
    var label = window.APP_CONFIG.conversionLabels[actionType] || actionType;

    // 1. Send to Google Analytics / gtag if available
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'conversion', {
        'send_to': window.APP_CONFIG.googleAdsId + '/' + label,
        'event_category': 'Engagement',
        'event_label': actionType,
        'value': 1.0
      });
      window.gtag('event', actionType, details);
    }

    // 2. Push to Google Tag Manager dataLayer if available
    if (window.dataLayer && Array.isArray(window.dataLayer)) {
      window.dataLayer.push({
        'event': 'bfa_conversion_' + actionType,
        'conversion_action': actionType,
        'conversion_details': details
      });
    }

    // Diagnostic console log
    console.log('[Analytics Tracker] Conversion Event Logged:', actionType, details);
  }

  // Expose trackConversion globally for inline calls if required
  window.trackConversion = trackConversion;

  // ==========================================================================
  // DOM INITIALIZATION
  // ==========================================================================
  document.addEventListener('DOMContentLoaded', function () {
    initDynamicContactLinks();
    initLeadForm();
    initFaqAccordion();
    initSmoothScrolling();
  });

  // ==========================================================================
  // DYNAMIC CONTACT LINK BINDINGS
  // ==========================================================================
  function initDynamicContactLinks() {
    var config = window.APP_CONFIG;

    // Build WhatsApp URL
    var encodedMsg = encodeURIComponent(config.whatsappPreFilledMsg);
    var waUrl = 'https://wa.me/' + config.whatsappNumber + '?text=' + encodedMsg;
    var telUrl = 'tel:' + config.phoneNumberTel;

    // Update all WhatsApp buttons
    var waElements = document.querySelectorAll('.js-whatsapp-btn');
    waElements.forEach(function (el) {
      el.setAttribute('href', waUrl);
      el.setAttribute('target', '_blank');
      el.setAttribute('rel', 'noopener noreferrer');
      el.addEventListener('click', function () {
        trackConversion('whatsappClick', { source: el.getAttribute('data-source') || 'button' });
      });
    });

    // Update all Phone / Call buttons
    var callElements = document.querySelectorAll('.js-call-btn');
    callElements.forEach(function (el) {
      el.setAttribute('href', telUrl);
      el.addEventListener('click', function () {
        trackConversion('phoneCallClick', { source: el.getAttribute('data-source') || 'button' });
      });
    });

    // Populate text placeholders if present
    document.querySelectorAll('.js-phone-display').forEach(function (el) {
      el.textContent = config.phoneNumberDisplay;
    });

    document.querySelectorAll('.js-email-display').forEach(function (el) {
      el.textContent = config.emailAddress;
      if (el.tagName === 'A') {
        el.setAttribute('href', 'mailto:' + config.emailAddress);
      }
    });

    document.querySelectorAll('.js-address-display').forEach(function (el) {
      el.textContent = config.officeAddress;
    });
  }

  // ==========================================================================
  // LEAD ENQUIRY FORM VALIDATION & HANDLING
  // ==========================================================================
  function initLeadForm() {
    var leadForm = document.getElementById('lead-enquiry-form');
    if (!leadForm) return;

    var alertSuccess = document.getElementById('form-success-alert');
    var alertError = document.getElementById('form-error-alert');
    var submitButton = document.getElementById('form-submit-btn');

    leadForm.addEventListener('submit', function (e) {
      e.preventDefault();

      // Reset alerts
      if (alertSuccess) {
        alertSuccess.classList.remove('show');
        alertSuccess.style.display = 'none';
      }
      if (alertError) {
        alertError.classList.remove('show');
        alertError.style.display = 'none';
        alertError.textContent = '';
      }

      // Collect form values
      var fullName = (document.getElementById('full_name') ? document.getElementById('full_name').value.trim() : '');
      var mobileNumber = (document.getElementById('mobile_number') ? document.getElementById('mobile_number').value.trim() : '');
      var city = (document.getElementById('city') ? document.getElementById('city').value.trim() : '');
      var preferredLocation = (document.getElementById('preferred_location') ? document.getElementById('preferred_location').value.trim() : '');
      var budget = (document.getElementById('investment_budget') ? document.getElementById('investment_budget').value : '');
      var message = (document.getElementById('message') ? document.getElementById('message').value.trim() : '');

      // Validation
      var errors = [];

      if (!fullName || fullName.length < 2) {
        errors.push("Please enter your full name.");
      }

      // Indian mobile format validation: 10 digits starting with 6, 7, 8, 9
      var cleanPhone = mobileNumber.replace(/[\s\-\+]/g, '');
      if (cleanPhone.startsWith('91') && cleanPhone.length === 12) {
        cleanPhone = cleanPhone.substring(2);
      } else if (cleanPhone.startsWith('0') && cleanPhone.length === 11) {
        cleanPhone = cleanPhone.substring(1);
      }

      var phonePattern = /^[6-9]\d{9}$/;
      if (!phonePattern.test(cleanPhone)) {
        errors.push("Please enter a valid 10-digit Indian mobile number.");
      }

      if (!city || city.length < 2) {
        errors.push("Please enter your city.");
      }

      if (!budget) {
        errors.push("Please select your approximate investment budget.");
      }

      if (errors.length > 0) {
        if (alertError) {
          alertError.textContent = errors[0];
          alertError.style.display = 'block';
          alertError.classList.add('show');
        } else {
          alert(errors.join("\n"));
        }
        return;
      }

      // Prepare Submission Payload
      var formData = {
        fullName: fullName,
        mobileNumber: cleanPhone,
        city: city,
        preferredLocation: preferredLocation || city,
        investmentBudget: budget,
        message: message,
        submittedAt: new Date().toISOString(),
        landingPageUrl: window.location.href,
        referrer: document.referrer || 'direct'
      };

      // Button loading state
      var originalBtnText = submitButton ? submitButton.innerHTML : 'Submit Enquiry';
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.innerHTML = 'Submitting Enquiry...';
      }

      // Fire conversion tracking
      trackConversion('formSubmission', {
        city: city,
        budget: budget
      });

      var webhookUrl = window.APP_CONFIG && window.APP_CONFIG.leadWebhookUrl;
      var hasValidWebhook = webhookUrl && webhookUrl.indexOf('http') === 0 && webhookUrl.indexOf('YOUR_GOOGLE_APPS_SCRIPT') === -1;

      function finalizeSubmission() {
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.innerHTML = originalBtnText;
        }
        leadForm.reset();
        window.location.href = 'thankyou.html';
      }

      if (hasValidWebhook) {
        // Send data to Google Apps Script Web App
        // Using 'text/plain;charset=utf-8' prevents CORS preflight blocking in browsers
        var redirectDone = false;
        var timeoutId = setTimeout(function () {
          if (!redirectDone) {
            redirectDone = true;
            finalizeSubmission();
          }
        }, 3000); // 3-second safety fallback timeout

        fetch(webhookUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: {
            'Content-Type': 'text/plain;charset=utf-8'
          },
          body: JSON.stringify(formData)
        })
          .then(function () {
            if (!redirectDone) {
              redirectDone = true;
              clearTimeout(timeoutId);
              finalizeSubmission();
            }
          })
          .catch(function (err) {
            console.warn('[Lead Form] Webhook submission error:', err);
            if (!redirectDone) {
              redirectDone = true;
              clearTimeout(timeoutId);
              finalizeSubmission();
            }
          });
      } else {
        // Webhook URL not configured yet - simulate brief delay and redirect
        console.info('[Lead Form] Lead data captured locally. Configure APP_CONFIG.leadWebhookUrl in script.js to save to Google Sheets & receive Gmail alerts.', formData);
        setTimeout(function () {
          finalizeSubmission();
        }, 600);
      }
    });
  }

  // ==========================================================================
  // FAQ ACCORDION HANDLER
  // ==========================================================================
  function initFaqAccordion() {
    var faqQuestions = document.querySelectorAll('.faq-question');
    faqQuestions.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var faqItem = btn.closest('.faq-item');
        var isCurrentlyActive = faqItem.classList.contains('active');

        // Close all other items
        document.querySelectorAll('.faq-item').forEach(function (item) {
          item.classList.remove('active');
          var toggleBtn = item.querySelector('.faq-question');
          if (toggleBtn) {
            toggleBtn.setAttribute('aria-expanded', 'false');
          }
        });

        // Toggle clicked item
        if (!isCurrentlyActive) {
          faqItem.classList.add('active');
          btn.setAttribute('aria-expanded', 'true');
        }
      });
    });
  }

  // ==========================================================================
  // SMOOTH SCROLLING FOR IN-PAGE ANCHORS
  // ==========================================================================
  function initSmoothScrolling() {
    var smoothLinks = document.querySelectorAll('a[href^="#"]');
    smoothLinks.forEach(function (link) {
      link.addEventListener('click', function (e) {
        var targetId = link.getAttribute('href');
        if (targetId === '#' || targetId === '') return;

        var targetElement = document.querySelector(targetId);
        if (targetElement) {
          e.preventDefault();
          var headerOffset = 70;
          var elementPosition = targetElement.getBoundingClientRect().top;
          var offsetPosition = elementPosition + window.pageYOffset - headerOffset;

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      });
    });
  }

})();
