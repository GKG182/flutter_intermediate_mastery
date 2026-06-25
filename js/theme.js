// theme.js
document.addEventListener('DOMContentLoaded', function() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.setAttribute('data-theme', 'dark');
    }

    const toggleButton = document.getElementById('theme-toggle');
    if (toggleButton) {
        toggleButton.addEventListener('click', function() {
            const current = document.documentElement.getAttribute('data-theme');
            const next = current === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', next);
            localStorage.setItem('theme', next);
            const icon = this.querySelector('.theme-icon');
            if (icon) icon.textContent = next === 'dark' ? '☀️' : '🌙';
        });
        // Set initial icon
        const icon = toggleButton.querySelector('.theme-icon');
        if (icon) {
            const current = document.documentElement.getAttribute('data-theme');
            icon.textContent = current === 'dark' ? '☀️' : '🌙';
        }
    }
});