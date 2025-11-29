const fs = require('fs');
const path = require('path');

const stylesCssPath = path.join(__dirname, 'styles.css');

function updateBreakpoints() {
    let content = fs.readFileSync(stylesCssPath, 'utf8');

    // Replace min-width: 769px with min-width: 1025px
    const minWidthRegex = /@media\s*\(min-width:\s*769px\)/g;
    if (minWidthRegex.test(content)) {
        content = content.replace(minWidthRegex, '@media (min-width: 1025px)');
        console.log('Updated min-width breakpoint to 1025px');
    } else {
        console.warn('Could not find min-width: 769px breakpoint');
    }

    // Replace max-width: 768px with max-width: 1024px
    const maxWidthRegex = /@media\s*\(max-width:\s*768px\)/g;
    if (maxWidthRegex.test(content)) {
        content = content.replace(maxWidthRegex, '@media (max-width: 1024px)');
        console.log('Updated max-width breakpoint to 1024px');
    } else {
        console.warn('Could not find max-width: 768px breakpoint');
    }

    fs.writeFileSync(stylesCssPath, content, 'utf8');
}

try {
    updateBreakpoints();
    console.log('Successfully updated breakpoints.');
} catch (error) {
    console.error('Error updating breakpoints:', error);
    process.exit(1);
}
