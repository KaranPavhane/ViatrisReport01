const { executeHttpRequest } = require('@sap-cloud-sdk/http-client');
const XLSX = require('xlsx');
const cds = require('@sap/cds');
const common = require('./lib/common');


module.exports = cds.service.impl(async function () {
  const { BatchData } = this.entities;

  const db = await cds.connect.to('db');

  /* Code to upload the excel file */
  this.on('BatchUpload', async (req) => {
    const tx = req.tx;

    if (!req.data || !req.data.BatchLoad) {
      return req.error(400, 'Missing BatchLoad data.');
    }

    const entries = Array.isArray(req.data.BatchLoad) ? req.data.BatchLoad : [req.data.BatchLoad];
    const results = [];

    // First, check for duplicates
    const duplicates = [];
    for (const entry of entries) {
      if (!entry) continue;

      const { batchNo, compCode, pkgSite, comments } = entry;

      // 👇 Updated logic: check for existing entry with batchNo + compCode
      const existing = await tx.run(
        SELECT.one.from(BatchData).where({ batchNo, compCode })
      );

      if (existing) {
        // 👇 If comment is empty or missing, reject as duplicate
        if (!comments || comments.trim() === "") {
          duplicates.push({
            ...entry,
            errMsg: `Duplicate entry: Record already exists and no comment provided.`,
          });

          await common.logError(
            cds,
            `Duplicate entry without comment for batchNo=${batchNo}, compCode=${compCode}`,
            "Loading File",
            "Batch Upload"
          );

          // Skip insertion for this entry
          continue;
        }

        // 👇 If comment is present, allow it — no duplicate push
      }
    }

    // If duplicates found, return them and skip insertion
    if (duplicates.length > 0) {
      return { results: duplicates };
    }

    // Otherwise, insert all entries
    for (const entry of entries) {
      const { batchNo, compCode, pkgSite, packingDate, releaseDate, comments } = entry;

      try {
        const dt = new Date();
        const createdDate = dt.getFullYear() + '-' + common.lpad(dt.getMonth() + 1, 2) + '-' + common.lpad(dt.getDate(),2);
        const ID = cds.utils.uuid();
        await tx.run(
          INSERT.into(BatchData).entries({ ID, batchNo, compCode, pkgSite, packingDate, releaseDate, comments, createdDate })
        );

        const inserted = await tx.run(SELECT.one.from(BatchData).where({ ID }));
        results.push(inserted);

      } catch (e) {
        const errMsg = `Unexpected error: ${e.message || JSON.stringify(e)}`;
        await common.logError(cds, errMsg, "Loading File", "Batch Upload");

        results.push({ batchNo, compCode, pkgSite, packingDate, releaseDate, comments, errMsg });
      }
    }

    return { results };
  });

  this.on('BatchUpload_New', async (req) => {
    const tx = req.tx;
    if (!req.data?.BatchLoad) return req.error(400, 'Missing BatchLoad data.');

    const entries = Array.isArray(req.data.BatchLoad) ? req.data.BatchLoad : [req.data.BatchLoad];
    const seen = new Set(), filtered = [];

    // Remove duplicates within the payload
    for (const e of entries) {
      const key = `${e.batchNo}__${e.compCode}__${e.pkgSite}__${e.comments}`;
      if (!seen.has(key)) {
        seen.add(key);
        filtered.push(e);
      }
    }

    // Step 1: Build OR expression for checking existing records
    let existingKeySet = new Set();
    if (filtered.length > 0) {
      const orExpr = cds.parse.expr(
        filtered.map(e =>
          `(batchNo = '${e.batchNo}' AND compCode = '${e.compCode}')`
        ).join(' OR ')
      );

      const existing = await tx.run(SELECT.from(BatchData).where(orExpr));

      // Store existing keys based only on batchNo and compCode
      existing.forEach(r => {
        const key = `${r.batchNo}__${r.compCode}`;
        existingKeySet.add(key);
      });
    }

    // Step 2: Apply rule-based duplicate handling
    const duplicates = [], toInsert = [];

    for (const e of filtered) {
      const key = `${e.batchNo}__${e.compCode}`;
      const hasComment = e.comments && e.comments.trim() !== '';

      if (existingKeySet.has(key) && !hasComment) {
        // ❌ Duplicate + No Comment → reject
        duplicates.push({ ...e, errMsg: 'Duplicate entry: Record already exists and no comment provided.' });

        await common.logError(
          cds,
          `Duplicate entry without comment for batchNo=${e.batchNo}, compCode=${e.compCode}`,
          'Loading File',
          'Batch Upload'
        );
      } else {
        // ✅ New record OR duplicate with comment → allow
        toInsert.push(e);
      }
    }

    // Step 3: Return only duplicates if any found (and skip insert)
    if (duplicates.length > 0) {
      const notInserted = toInsert.map(e => ({
        ...e,
        errMsg: 'Not inserted due to duplicate(s) found in the batch.'
      }));
      return { results: [...duplicates] };
    }

    // Step 4: Insert new entries
    const results = [];

    if (toInsert.length > 0) {
      const dt = new Date();
      const createdDate = dt.getFullYear() + '-' + common.lpad(dt.getMonth() + 1, 2) + '-' + common.lpad(dt.getDate(),2);
      const entriesToInsert = toInsert.map(e => ({
        ID: cds.utils.uuid(),
        batchNo: e.batchNo,
        compCode: e.compCode,
        pkgSite: e.pkgSite,
        packingDate: e.packingDate,
        releaseDate: e.releaseDate,
        comments: e.comments,
        createdDate: createdDate
      }));

      try {
        await tx.run(INSERT.into(BatchData).entries(entriesToInsert));
        results.push(...entriesToInsert);
      } catch (e) {
        const errMsg = `Bulk insert error: ${e.message || JSON.stringify(e)}`;
        await common.logError(cds, errMsg, 'Loading File', 'Batch Upload');
        toInsert.forEach(entry => results.push({ ...entry, errMsg }));
      }
    }

    return { results };
  });

  this.on('convertExcelToCsv', async (req) => {
    try {
      const base64Data = req.data.file;
      const fileBuffer = Buffer.from(base64Data, 'base64');
      const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const csvText = XLSX.utils.sheet_to_csv(workbook.Sheets[sheetName]);
      return { csvText, message: 'Excel converted to CSV successfully' };
    } catch (err) {
      console.error(err);
      req.error(500, 'Error converting Excel to CSV');
    }
  });

});





