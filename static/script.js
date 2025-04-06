document.addEventListener('DOMContentLoaded', function() {
  // --- Get DOM Elements ---
  const userDetailsForm = document.getElementById('user-details-form');
  const imageUploadForm = document.getElementById('upload-form');
  const connectDeviceBtn = document.getElementById('connect-device');

  // User Detail Inputs & Error Spans
  const ageInput = document.getElementById('age');
  const genderInput = document.getElementById('gender');
  const heightInput = document.getElementById('height');
  const weightInput = document.getElementById('weight');
  const bmiInput = document.getElementById('bmi');

  const ageError = document.getElementById('age-error');
  const genderError = document.getElementById('gender-error');
  const heightError = document.getElementById('height-error');
  const weightError = document.getElementById('weight-error');

  // Image Upload Elements
  const ecgImageInput = document.getElementById('ecgImage');
  const imageNameDisplay = document.getElementById('image-name');
  const imageDropZone = document.getElementById('image-drop-zone');
  const ecgImageError = document.getElementById('ecgImage-error');

  // Action Cards (for showing/hiding loading state)
  const uploadCard = document.getElementById('upload-card');
  const connectCard = document.getElementById('connect-card');

  // Progress Bar (inside connect card)
  const connectProgress = document.getElementById('connect-progress');
  const connectError = document.getElementById('connect-error');

  // --- Validation Function ---
  function validateUserDetails() {
      let isValid = true;
      // Clear previous errors
      [ageError, genderError, heightError, weightError, connectError, ecgImageError].forEach(el => {
          if (el) el.textContent = '';
      });
      [ageInput, genderInput, heightInput, weightInput].forEach(el => el.classList.remove('invalid'));
      // Also clear general errors possibly shown on cards
       connectError.textContent = '';


      // Validation checks (same as before)...
      if (!ageInput.value || ageInput.value < 1 || ageInput.value > 120) {
          ageError.textContent = 'Please enter a valid age (1-120).';
          ageInput.classList.add('invalid');
          isValid = false;
      }
      if (!genderInput.value) {
          genderError.textContent = 'Please select a gender.';
          genderInput.classList.add('invalid');
          isValid = false;
      }
      if (!heightInput.value || heightInput.value < 50 || heightInput.value > 250) {
          heightError.textContent = 'Please enter a valid height (50-250 cm).';
          heightInput.classList.add('invalid');
          isValid = false;
      }
      if (!weightInput.value || weightInput.value < 1 || weightInput.value > 300) {
          weightError.textContent = 'Please enter a valid weight (1-300 kg).';
          weightInput.classList.add('invalid');
          isValid = false;
      }

      // Calculate BMI (same as before)...
      if (heightInput.value && weightInput.value && heightInput.value > 0) {
          const heightM = parseFloat(heightInput.value) / 100;
          const weightKg = parseFloat(weightInput.value);
          const bmiValue = (weightKg / (heightM * heightM)).toFixed(1);
          bmiInput.value = bmiValue;
      } else {
          bmiInput.value = '';
      }

      return isValid;
  }

  // --- Event Listeners ---

  // Validate on input blur
  [ageInput, genderInput, heightInput, weightInput].forEach(input => {
      input.addEventListener('blur', validateUserDetails);
  });

  // Image File Input Change & Drag/Drop (mostly same as before)
  ecgImageInput.addEventListener('change', function(e) { handleFileSelection(e.target.files); });
  imageDropZone.addEventListener('dragover', function(e) { e.preventDefault(); imageDropZone.classList.add('dragover'); });
  imageDropZone.addEventListener('dragleave', function(e) { e.preventDefault(); imageDropZone.classList.remove('dragover'); });
  imageDropZone.addEventListener('drop', function(e) {
      e.preventDefault();
      imageDropZone.classList.remove('dragover');
      handleFileSelection(e.dataTransfer.files);
  });

  function handleFileSelection(files) {
      ecgImageError.textContent = '';
      imageDropZone.classList.remove('invalid'); // Reset drop zone style
      if (files && files.length > 0) {
          const file = files[0];
          if (file.type.startsWith('image/')) {
              ecgImageInput.files = files;
              imageNameDisplay.textContent = file.name;
              imageNameDisplay.style.fontStyle = 'normal';
              imageNameDisplay.style.color = 'var(--text-light)'; // Reset color
              ecgImageInput.classList.remove('invalid');
          } else {
              imageNameDisplay.textContent = 'Invalid file type (Images only)';
              imageNameDisplay.style.fontStyle = 'italic';
              imageNameDisplay.style.color = 'var(--danger)';
              ecgImageInput.value = '';
              ecgImageInput.classList.add('invalid');
              ecgImageError.textContent = 'Only image files (PNG, JPG, GIF) allowed.';
          }
      } else {
          imageNameDisplay.textContent = 'No file selected';
          imageNameDisplay.style.fontStyle = 'italic';
          imageNameDisplay.style.color = 'var(--text-light)';
      }
  }

  // Image Upload Form Submission
  imageUploadForm.addEventListener('submit', function(e) {
      // Clear processing state from the *other* card if it was active
      connectCard.classList.remove('is-processing');

      const userDetailsValid = validateUserDetails();
      let fileValid = true;

      if (!ecgImageInput.files || ecgImageInput.files.length === 0) {
          ecgImageError.textContent = 'Please select or drop an ECG image file.';
          ecgImageInput.classList.add('invalid');
          imageDropZone.classList.add('invalid'); // Add invalid style to dropzone too
          fileValid = false;
      } else {
           ecgImageError.textContent = '';
           ecgImageInput.classList.remove('invalid');
           imageDropZone.classList.remove('invalid');
      }

      if (!userDetailsValid || !fileValid) {
          e.preventDefault();
          uploadCard.classList.remove('is-processing'); // Ensure loading not shown if invalid
          const firstError = document.querySelector('.invalid');
           if (firstError) {
              firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
           }
          // Consider showing a general error message instead of alert
          // alert('Please correct the errors before submitting.');
      } else {
          // Validation passed, show INLINE loading state
          uploadCard.classList.add('is-processing');
          // Form submission will proceed naturally
      }
  });

  // Connect to Device Button Click
  connectDeviceBtn.addEventListener('click', function() {
       // Clear processing state from the *other* card if it was active
      uploadCard.classList.remove('is-processing');
      connectError.textContent = ''; // Clear previous connect error

      if (!validateUserDetails()) {
          connectCard.classList.remove('is-processing'); // Ensure loading not shown
          connectError.textContent = 'Please fill in patient details first.';
           const firstError = document.querySelector('.invalid');
           if (firstError) {
              firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
           }
          return;
      }

      // Show INLINE connecting state
      connectCard.classList.add('is-processing');
      connectProgress.style.width = '0%'; // Reset progress

      // Animate progress bar (Simulating connection)
      let progress = 0;
      const duration = 5000; // 5 seconds simulation
      const intervalTime = 50;
      const steps = duration / intervalTime;
      const increment = 100 / steps;

      // Clear any existing interval first
      if (window.connectIntervalId) {
          clearInterval(window.connectIntervalId);
      }

      window.connectIntervalId = setInterval(function() {
          progress += increment;
          connectProgress.style.width = Math.min(progress, 100) + '%';

          if (progress >= 100) {
              clearInterval(window.connectIntervalId);
              window.connectIntervalId = null; // Clear interval ID
              console.log("Connection simulation complete. Redirecting...");
              setTimeout(function() {
                  // Optional: Remove processing state before redirect if needed,
                  // but usually redirect happens fast enough.
                  // connectCard.classList.remove('is-processing');
                  window.location.href = '/result';
              }, 300); // Shorter delay
          }
      }, intervalTime);
  });

  // Optional: Clear processing state if user interacts with the form again
  userDetailsForm.addEventListener('input', () => {
      uploadCard.classList.remove('is-processing');
      connectCard.classList.remove('is-processing');
      if(window.connectIntervalId) clearInterval(window.connectIntervalId); // Stop connect timer if user types
  });
   imageUploadForm.addEventListener('click', () => { // Clear connect if user interacts with upload
       connectCard.classList.remove('is-processing');
       if(window.connectIntervalId) clearInterval(window.connectIntervalId);
   });


}); // End DOMContentLoaded