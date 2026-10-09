// Retrieve the toggle button element from the DOM
let theme_toggler = document.querySelector('#theme_toggler');

// Add a click event listener to the button
theme_toggler.addEventListener('click', function(){
  
  // Toggles the 'alternate_theme' class on and off every time it is clicked
  document.body.classList.toggle('alternate_theme');
  
  if(document.body.classList.contains('alternate_theme')){
    // If the class is active, save 'alternate_theme' to localStorage
    localStorage.setItem('website_theme', 'alternate_theme');
  } else {
    // Revert it to 'default'
    localStorage.setItem('website_theme', 'default');
  }
});

// FPull the saved theme from storage and apply it
function retrieve_theme(){
  var theme = localStorage.getItem('website_theme');
  
  // Verify that a theme exists
  if(theme != null){
    // Clear out both classes to avoid overlap, then add the saved one
    document.body.classList.remove('default', 'alternate_theme');
    document.body.classList.add(theme);
  }
}

// Load to apply the saved theme
retrieve_theme();

// Adds an event listener to the storage event
// If the user changes the theme in one browser tab, it updates across all other open tabs of the site
window.addEventListener("storage", function(){
  retrieve_theme();
}, false);