const fs = require('fs');
const path = require('path');

const indexHtmlPath = path.join(__dirname, 'index.html');
const stylesCssPath = path.join(__dirname, 'styles.css');

function updateIndexHtml() {
    let content = fs.readFileSync(indexHtmlPath, 'utf8');

    // 1. Update Mobile Menu Toggle (Header)
    const mobileMenuRegex = /<button id="mobileMenuToggle" class="mobile-menu-toggle" aria-label="Open menu">\s*<svg[\s\S]*?<\/svg>\s*<\/button>/;
    const newMobileMenuHtml = `<button id="mobileMenuToggle" class="mobile-menu-toggle" aria-label="Open menu">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="3" y1="12" x2="21" y2="12"></line>
                    <line x1="3" y1="6" x2="21" y2="6"></line>
                    <line x1="3" y1="18" x2="21" y2="18"></line>
                </svg>
            </button>`;

    if (mobileMenuRegex.test(content)) {
        content = content.replace(mobileMenuRegex, newMobileMenuHtml);
        console.log('Updated mobileMenuToggle in index.html');
    } else {
        console.error('Could not find mobileMenuToggle in index.html');
    }

    // 2. Update Sidebar Toggle (Sidebar)
    const sidebarToggleRegex = /<button id="sidebarToggle" class="sidebar-toggle-btn" aria-label="Toggle sidebar">\s*<svg[\s\S]*?<\/svg>\s*<\/button>/;
    const newSidebarToggleHtml = `<button id="sidebarToggle" class="sidebar-toggle-btn" aria-label="Toggle sidebar">
                <svg class="icon-desktop" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="9" y1="3" x2="9" y2="21"></line>
                </svg>
                <svg class="icon-mobile" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="3" y1="12" x2="21" y2="12"></line>
                    <line x1="3" y1="6" x2="21" y2="6"></line>
                    <line x1="3" y1="18" x2="21" y2="18"></line>
                </svg>
            </button>`;

    if (sidebarToggleRegex.test(content)) {
        content = content.replace(sidebarToggleRegex, newSidebarToggleHtml);
        console.log('Updated sidebarToggle in index.html');
    } else {
        console.error('Could not find sidebarToggle in index.html');
    }

    fs.writeFileSync(indexHtmlPath, content, 'utf8');
}

function updateStylesCss() {
    let content = fs.readFileSync(stylesCssPath, 'utf8');

    // 1. Add base classes
    const baseClasses = `
/* Icon toggling for sidebar button */
.icon-mobile {
    display: none;
}
.icon-desktop {
    display: block;
}
`;
    // Insert before "/* Desktop Responsive */" or similar anchor if not already present
    if (!content.includes('.icon-mobile {')) {
        const anchor = '/* Desktop Responsive */';
        if (content.includes(anchor)) {
            content = content.replace(anchor, baseClasses + '\n' + anchor);
            console.log('Added base classes to styles.css');
        } else {
            console.error('Could not find anchor for base classes in styles.css');
        }
    }

    // 2. Add mobile toggle logic
    const mobileToggleLogic = `
    /* Toggle icons on mobile */
    .icon-mobile {
        display: block;
    }
    .icon-desktop {
        display: none;
    }
`;
    // Insert inside "@media (max-width: 768px) {"
    const mediaQueryStart = '@media (max-width: 768px) {';
    if (content.includes(mediaQueryStart) && !content.includes('.icon-mobile {', content.indexOf(mediaQueryStart))) {
        content = content.replace(mediaQueryStart, mediaQueryStart + mobileToggleLogic);
        console.log('Added mobile toggle logic to styles.css');
    } else {
        console.log('Mobile toggle logic might already be present or media query not found');
    }

    fs.writeFileSync(stylesCssPath, content, 'utf8');
}

try {
    updateIndexHtml();
    updateStylesCss();
    console.log('Successfully updated icons via script.');
} catch (error) {
    console.error('Error updating files:', error);
    process.exit(1);
}
