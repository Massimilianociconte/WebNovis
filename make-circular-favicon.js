const sharp = require('sharp');

async function processFavicon() {
  try {
    // 1. Legge l'immagine e fa un trim aggressivo per togliere tutto il nero/spazio vuoto attorno al logo reale
    const image = sharp('Img/logo-webnovis-perfotoprofilo.png');
    
    // Usiamo trim con una soglia alta per rimuovere lo sfondo nero (assumendo che lo sfondo sia nero)
    const trimmed = await image.trim({ threshold: 10 }).toBuffer();
    
    // 2. Crea un cerchio perfetto di dimensioni 1024x1024 con sfondo trasparente e un cerchio nero dentro
    const size = 1024;
    // Padding del 18% per essere sicuri che il logo non sia troppo attaccato ai bordi
    const padding = parseInt(size * 0.18); 
    const innerSize = size - (padding * 2);
    
    // Ridimensiona il logo trimmato per stare esattamente dentro innerSize
    const resizedLogo = await sharp(trimmed)
      .resize(innerSize, innerSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .toBuffer();
      
    // Maschera circolare in SVG
    const circleSvg = `<svg width="${size}" height="${size}">
      <circle cx="${size/2}" cy="${size/2}" r="${size/2}" fill="black" />
    </svg>`;
    
    // Composizione: Sfondo trasparente -> Cerchio nero -> Logo
    const finalImage = await sharp({
      create: {
        width: size,
        height: size,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      }
    })
    .composite([
      { input: Buffer.from(circleSvg), blend: 'over' },
      { input: resizedLogo, blend: 'over' }
    ])
    .png()
    .toBuffer();
    
    // Salva le versioni
    await sharp(finalImage).resize(192, 192).toFile('Img/favicon.png');
    await sharp(finalImage).resize(48, 48).toFile('favicon.ico');
    
    console.log('Favicon circolari creati con successo!');
  } catch (error) {
    console.error('Errore:', error);
  }
}

processFavicon();
