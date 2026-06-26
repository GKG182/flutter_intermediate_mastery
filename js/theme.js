// theme.js
document.addEventListener('DOMContentLoaded', function() {
    const toggleButton = document.getElementById('theme-toggle');
    
    if (toggleButton) {
        // Read the current theme that was set by the inline script in <head>
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const icon = toggleButton.querySelector('.theme-icon');
        
        // Set the correct initial icon
        if (icon) {
            icon.textContent = currentTheme === 'dark' ? '☀️' : '🌙';
        }

        // Handle button clicks
        toggleButton.addEventListener('click', function() {
            const current = document.documentElement.getAttribute('data-theme');
            const next = current === 'dark' ? 'light' : 'dark';
            
            document.documentElement.setAttribute('data-theme', next);
            localStorage.setItem('theme', next);
            
            if (icon) {
                icon.textContent = next === 'dark' ? '☀️' : '🌙';
            }
        });
    }
});