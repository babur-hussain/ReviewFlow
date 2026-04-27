const QRCode = require("qrcode");

async function makeQrCodes(url) {
  const [qrCodeSvg, qrCodePngDataUrl] = await Promise.all([
    QRCode.toString(url, { type: "svg", margin: 2, width: 1024 }),
    QRCode.toDataURL(url, { type: "image/png", margin: 2, width: 1024 }),
  ]);

  return { qrCodeSvg, qrCodePngDataUrl };
}

module.exports = makeQrCodes;
