const fs = require('fs');
let c = fs.readFileSync('lib/models/Tenant.ts', 'utf8');

// Find the closing brace of IResellerConfig interface
const marker = 'footerText: string;              // Texto del footer:';
const idx = c.indexOf(marker);
if (idx === -1) { console.error('marker not found'); process.exit(1); }

// Find the closing brace after footerText line
const closeIdx = c.indexOf('\n}', idx);
if (closeIdx === -1) { console.error('close brace not found'); process.exit(1); }

const newFields = `
    // Personalización visual Pro
    primaryColor?: string;
    buttonText?: string;
    buttonSubtext?: string;
    ctaText?: string;
    badgeText?: string;
    whatsappMessage?: string;
    trustBadge1?: string;
    trustBadge2?: string;
    trustBadge3?: string;
    step1Title?: string;
    step1Desc?: string;
    step2Title?: string;
    step2Desc?: string;
    step3Title?: string;
    step3Desc?: string;`;

// Insert newFields before the closing brace
c = c.substring(0, closeIdx) + newFields + c.substring(closeIdx);
fs.writeFileSync('lib/models/Tenant.ts', c, 'utf8');
console.log('OK - Interface updated at index', closeIdx);
