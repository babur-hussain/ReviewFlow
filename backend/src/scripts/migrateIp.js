const mongoose = require("mongoose");
const env = require("../config/env");
const Business = require("../models/Business");
const connectDb = require("../config/db");
const makeQrCodes = require("../utils/qr");

async function migrate() {
    await connectDb();
    const businesses = await Business.find({});
    console.log(`Found ${businesses.length} businesses to update.`);

    for (const business of businesses) {
        const newPageUrl = `${env.publicBaseUrl.replace(/\/$/, "")}/review/${business.slug}`;
        console.log(`Updating ${business.name}: ${business.reviewPageUrl} -> ${newPageUrl}`);

        const qrCodes = await makeQrCodes(newPageUrl);

        business.reviewPageUrl = newPageUrl;
        business.qrCodeSvg = qrCodes.qrCodeSvg;
        business.qrCodePngDataUrl = qrCodes.qrCodePngDataUrl;

        await business.save();
    }

    console.log("Migration complete.");
    process.exit(0);
}

migrate().catch((err) => {
    console.error("Migration failed:", err);
    process.exit(1);
});
