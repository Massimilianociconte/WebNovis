const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory() && !file.includes('.git') && !file.includes('node_modules')) {
            results = results.concat(walk(file));
        } else {
            if (file.endsWith('.html')) {
                results.push(file);
            }
        }
    });
    return results;
}

const htmlFiles = walk('c:/Users/Massi/Documents/Webnovis_kiro - backup');

const ICONS = {
    sparkles: '<svg class="chat-inline-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px;vertical-align:middle;margin-left:4px;"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>',
    zap: '<svg class="chat-inline-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px;vertical-align:middle;margin-left:4px;"><path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/></svg>',
    smile: '<svg class="chat-inline-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px;vertical-align:middle;margin-left:4px;"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" x2="9.01" y1="9" y2="9"/><line x1="15" x2="15.01" y1="9" y2="9"/></svg>'
};

let updated = 0;

htmlFiles.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    // Replace the chat header profile image styles
    content = content.replace(
        /<picture><source srcset="Img\/robot\.webp" type="image\/webp"><img alt="Weby" src="Img\/robot-112\.webp" height="36" width="36" style="border-radius:50%"><\/picture>/g,
        '<picture><source srcset="Img/robot.webp" type="image/webp"><img alt="Weby" src="Img/robot-112.webp" class="bot-avatar-img"></picture>'
    );

    // Replace the message avatar
    content = content.replace(
        /<div class="message-avatar">🤖<\/div>/g,
        '<div class="message-avatar"><picture><source srcset="Img/robot.webp" type="image/webp"><img alt="Weby" src="Img/robot-112.webp" class="bot-avatar-img"></picture></div>'
    );

    // Replace text emojis with icons
    content = content.replace(/Online e pronto ad aiutarti! 💡/g, 'Online e pronto ad aiutarti! ' + ICONS.zap);
    content = content.replace(/Ciao! Sono Weby 👋/g, 'Ciao! Sono Weby ' + ICONS.sparkles);
    content = content.replace(/Sono qui per aiutarti! 💡/g, 'Sono qui per aiutarti! ' + ICONS.smile);

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        updated++;
        console.log(`Updated ${file}`);
    }
});

console.log(`\nTotal files updated: ${updated}`);
