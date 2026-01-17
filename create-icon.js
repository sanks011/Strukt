const sharp = require('sharp');
const path = require('path');

const inputSvg = path.join(__dirname, 'resources', 'icon-source.svg');
const outputPng = path.join(__dirname, 'resources', 'icon.png');

sharp(inputSvg)
  .resize(128, 128)
  .png()
  .toFile(outputPng)
  .then(() => {
    console.log('✅ Icon created successfully: resources/icon.png');
  })
  .catch(err => {
    console.error('❌ Error creating icon:', err);
  });
