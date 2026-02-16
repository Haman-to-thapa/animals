const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const densities = [
    { name: 'mdpi', size: 48 },
    { name: 'hdpi', size: 72 },
    { name: 'xhdpi', size: 96 },
    { name: 'xxhdpi', size: 144 },
    { name: 'xxxhdpi', size: 192 },
];

const androidResDir = path.join(__dirname, 'android', 'app', 'src', 'main', 'res');
const sourceImage = path.join(__dirname, 'play_store_512.png');

async function generateIcons() {
    if (!fs.existsSync(sourceImage)) {
        console.error('Source image not found:', sourceImage);
        return;
    }

    for (const density of densities) {
        const dir = path.join(androidResDir, `mipmap-${density.name}`);
        if (!fs.existsSync(dir)) {
            console.log(`Directory not found: ${dir}, creating...`);
            fs.mkdirSync(dir, { recursive: true });
        }

        console.log(`Generating icons for ${density.name} (${density.size}x${density.size})...`);

        // Standard Icon
        await sharp(sourceImage)
            .resize(density.size, density.size)
            .toFile(path.join(dir, 'ic_launcher.png'));

        // Round Icon
        await sharp(sourceImage)
            .resize(density.size, density.size)
            .composite([{
                input: Buffer.from(
                    `<svg><circle cx="${density.size / 2}" cy="${density.size / 2}" r="${density.size / 2}" /></svg>`
                ),
                blend: 'dest-in'
            }])
            .toFile(path.join(dir, 'ic_launcher_round.png'));
    }
    console.log('Icons generated successfully!');
}

generateIcons().catch(err => console.error(err));
