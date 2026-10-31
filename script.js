/**
 * ============================================================================
 * BAKERY FRANCHISE PARTNER - JAVASCRIPT & TRACKING INTEGRATION
 * Website: https://bakeryfranchisepartner.in/
 * ============================================================================
 */

(function () {
  'use strict';

  // ==========================================================================
  // CLIENT & TRACKING CONFIGURATION (Easily replace values here)
  // ==========================================================================
  window.APP_CONFIG = {
    // Business Contact Details
    businessName: "Bakery Franchise Partner",
    phoneNumberDisplay: "+91 99354 94314",
    phoneNumberTel: "+919935494314",
    leadEmail: "leadmonginis@gmail.com",
    emailAddress: "leadmonginis@gmail.com",
    officeAddress: "C-1034, Opposite Bhootnath Market, A Block, Indira Nagar, Lucknow - 226016",
    operatingHours: "Mon - Sat: 10:00 AM - 7:00 PM IST",

    // Google Ads & Analytics Tracking Configuration
    googleAdsId: "AW-18435726150",
    gtmId: "GTM-P94VCCMQ",
    conversionLabels: {
      formSubmission: "YOUR_CONVERSION_LABEL_FORM",
      phoneCallClick: "YOUR_CONVERSION_LABEL_PHONE"
    },

    // Form Delivery Endpoints
    emailEndpoint: "https://formsubmit.co/ajax/leadmonginis@gmail.com",
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
    var telUrl = 'tel:' + config.phoneNumberTel;

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

      // Map budget label for clear email readability
      var budgetMap = {
        '5_10_lakhs': '₹5 Lakhs - ₹10 Lakhs',
        '10_15_lakhs': '₹10 Lakhs - ₹15 Lakhs',
        '15_25_lakhs': '₹15 Lakhs - ₹25 Lakhs',
        'above_25_lakhs': 'Above ₹25 Lakhs',
        'to_be_discussed': 'To be discussed'
      };
      var budgetLabel = budgetMap[budget] || budget;

      // Prepare Submission Payload for Webhook & Email
      var formData = {
        fullName: fullName,
        mobileNumber: cleanPhone,
        city: city,
        preferredLocation: preferredLocation || city,
        investmentBudget: budgetLabel,
        message: message,
        submittedAt: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
        landingPageUrl: window.location.href,
        referrer: document.referrer || 'direct'
      };

      // Button loading state
      var originalBtnText = submitButton ? submitButton.innerHTML : 'Submit Enquiry';
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.innerHTML = 'Submitting Enquiry...';
      }

      // Fire conversion tracking immediately
      trackConversion('formSubmission', {
        city: city,
        budget: budget
      });

      // Target Thank-You URL based on path
      var thankYouUrl = (window.location.pathname.indexOf('/monginis-cakes/') !== -1)
        ? '../thankyou.html'
        : 'thankyou.html';

      var redirectDone = false;
      function finalizeSubmission() {
        if (redirectDone) return;
        redirectDone = true;

        if (submitButton) {
          submitButton.disabled = false;
          submitButton.innerHTML = originalBtnText;
        }

        leadForm.reset();

        // Redirect to Thank-You Page
        window.location.href = thankYouUrl;
      }

      // Fail-safe redirect after 2.5s if network is slow
      var timeoutId = setTimeout(function () {
        finalizeSubmission();
      }, 2500);

      // 1. Dispatch to FormSubmit for direct delivery to leadmonginis@gmail.com
      var emailPayload = {
        "Applicant Name": fullName,
        "Mobile Number": "+91 " + cleanPhone,
        "City / Town": city,
        "Preferred Area": preferredLocation || city,
        "Investment Budget": budgetLabel,
        "Shop Details / Notes": message || 'None provided',
        "Submitted At": formData.submittedAt,
        "Landing Page URL": window.location.href,
        "_subject": "🎂 New Monginis Franchise Lead: " + fullName + " (" + city + ")",
        "_template": "table",
        "_captcha": "false"
      };

      var formSubmitPromise = fetch(window.APP_CONFIG.emailEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(emailPayload)
      }).catch(function (err) {
        console.warn('[Lead Form] Email dispatch warning:', err);
      });

      // 2. Dispatch in parallel to Google Apps Script Webhook (for Google Sheets logging)
      var webhookUrl = window.APP_CONFIG && window.APP_CONFIG.leadWebhookUrl;
      var webhookPromise = null;
      if (webhookUrl && webhookUrl.indexOf('http') === 0 && webhookUrl.indexOf('YOUR_GOOGLE_APPS_SCRIPT') === -1) {
        webhookPromise = fetch(webhookUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: {
            'Content-Type': 'text/plain;charset=utf-8'
          },
          body: JSON.stringify(formData)
        }).catch(function (err) {
          console.warn('[Lead Form] Webhook dispatch warning:', err);
        });
      }

      // When primary email dispatch returns, proceed to Thank You page
      Promise.all([formSubmitPromise, webhookPromise])
        .then(function () {
          clearTimeout(timeoutId);
          finalizeSubmission();
        })
        .catch(function () {
          clearTimeout(timeoutId);
          finalizeSubmission();
        });
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

        // Toggle active item
        if (!isCurrentlyActive) {
          faqItem.classList.add('active');
          btn.setAttribute('aria-expanded', 'true');
        } else {
          faqItem.classList.remove('active');
          btn.setAttribute('aria-expanded', 'false');
        }
      });
    });
  }

  // ==========================================================================
  // SMOOTH SCROLLING FOR IN-PAGE ANCHORS
  // ==========================================================================
  function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
      anchor.addEventListener('click', function (e) {
        var targetId = this.getAttribute('href');
        if (targetId === '#' || targetId === '#!') return;

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
