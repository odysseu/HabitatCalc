document.addEventListener("DOMContentLoaded", function () {
    const toggleSwitch = document.getElementById("dark-mode-toggle");
    const currentTheme = localStorage.getItem("theme") ? localStorage.getItem("theme") : null;
    const homeLogo = document.getElementById("home-logo");
    const favicon = document.getElementById("favicon");
    const githubLogo = document.getElementById("github-logo");

    // Function to switch logos and favicons
    function switchTheme(theme) {
        if (theme === "dark-mode") {
            document.body.classList.add("dark-mode");
            if (homeLogo) homeLogo.src = "logos/home-logo-dark.png";
            if (favicon) favicon.href = "logos/favicon-dark.ico";
            if (githubLogo) githubLogo.src = "logos/github-logo-dark.png";
        } else {
            document.body.classList.remove("dark-mode");
            if (homeLogo) homeLogo.src = "logos/home-logo-light.png";
            if (favicon) favicon.href = "logos/favicon-light.ico";
            if (githubLogo) githubLogo.src = "logos/github-logo-light.png";
        }
    }

    if (currentTheme) {
        switchTheme(currentTheme);
        if (currentTheme === "dark-mode" && toggleSwitch) {
            toggleSwitch.checked = true;
        }
    }

    if (toggleSwitch) {
        toggleSwitch.addEventListener("change", function () {
            const theme = toggleSwitch.checked ? "dark-mode" : "light-mode";
            switchTheme(theme);
            localStorage.setItem("theme", theme);
        });
    }
});