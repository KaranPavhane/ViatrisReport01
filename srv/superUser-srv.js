const { executeHttpRequest } = require('@sap-cloud-sdk/http-client');
const XLSX = require('xlsx');
const cds = require('@sap/cds');
const common = require('./lib/common');


module.exports = cds.service.impl(async function () {
  const { BatchData, M_PackagingSite, T_PackagingSite, T_PackagingSite_Users } = this.entities;

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
        const createdDate = dt.getFullYear() + '-' + common.lpad(dt.getMonth() + 1, 2) + '-' + common.lpad(dt.getDate(), 2);
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
      const createdDate = dt.getFullYear() + '-' + common.lpad(dt.getMonth() + 1, 2) + '-' + common.lpad(dt.getDate(), 2);
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

  this.on('GetTrackwiseReport', async (req) => {

    const { fromDate, toDate } = req.data;

    if (!fromDate || !toDate) {
      throw new error('Please provide fromDate and toDate query parameters');
    }

    const db = await cds.connect.to('db');

    const sql = `WITH BaseData AS (
                SELECT t1.batchNo,t1.compCode,t1.pkgSite,t2.PKGSITENAME,t1.packingDate,t1.releaseDate
                FROM "BATCHPACKRELEASE_DB_BATCHDATA" as t1 inner join "BATCHPACKRELEASE_DB_M_PACKAGINGSITE" as t2 on t1.PKGSITE = T2.PKGSITE
                WHERE t1.CREATEDDATE BETWEEN ? AND ?
                ),

                RankedPacking AS (
                SELECT *,
                RANK() OVER (PARTITION BY compCode, pkgSite ORDER BY packingDate ASC) AS rank_pack_asc,
                RANK() OVER (PARTITION BY compCode, pkgSite ORDER BY packingDate DESC) AS rank_pack_desc
                FROM BaseData
                WHERE packingDate IS NOT NULL
                ),
                RankedRelease AS (
                SELECT *,
                RANK() OVER (PARTITION BY compCode, pkgSite ORDER BY releaseDate ASC) AS rank_rel_asc,
                RANK() OVER (PARTITION BY compCode, pkgSite ORDER BY releaseDate DESC) AS rank_rel_desc
                FROM BaseData
                WHERE releaseDate IS NOT NULL
                ),

                ReleaseStats AS (
                SELECT compCode,pkgSite,
                MIN(releaseDate) AS firstReleaseDateToMarket,
                MAX(releaseDate) AS lastReleaseDateToMarket
                FROM BaseData GROUP BY compCode, pkgSite
                ),

                FirstLastPacking AS (
                SELECT compCode,pkgSite,PKGSITENAME,
                MAX(CASE WHEN rank_pack_asc = 1 THEN batchNo END) AS batchFirstUsed,
                MAX(CASE WHEN rank_pack_desc = 1 THEN batchNo END) AS batchLastUsed,
                MIN(packingDate) AS dateFirstUsedInPackaging,
                MAX(packingDate) AS dateLastUsedInPackaging
                FROM RankedPacking GROUP BY compCode, pkgSite, PKGSITENAME
                ),

                FirstLastRelease AS (
                SELECT compCode,pkgSite,
                MAX(CASE WHEN rank_rel_asc = 1 THEN batchNo END) AS batchFirstReleaseToMarket,
                MAX(CASE WHEN rank_rel_desc = 1 THEN batchNo END) AS batchLastReleaseToMarket
                FROM RankedRelease GROUP BY compCode, pkgSite
                )

                SELECT
                p.pkgSite as "Packaging Site Code",p.PKGSITENAME as "Packaging Site Name",p.compCode as "Packging Site Component Code",
                p.dateFirstUsedInPackaging as "Date of First Packaging",p.dateLastUsedInPackaging as "Date of Last Packaging",
                r.firstReleaseDateToMarket as "Date of First Release",r.lastReleaseDateToMarket as "Date of Last Release",
                p.batchFirstUsed "Batch No. of First Packaging",p.batchLastUsed as "Batch No. of Last Packaging",
                fr.batchFirstReleaseToMarket "Batch No. of First Release",fr.batchLastReleaseToMarket as "Batch No. of Last Release"
                FROM FirstLastPacking p JOIN ReleaseStats r
                ON p.compCode= r.compCode AND p.pkgSite= r.pkgSite
                JOIN FirstLastRelease fr
                ON p.compCode= fr.compCode AND p.pkgSite= fr.pkgSite
                ORDER BY p.pkgSite, p.compCode`;

    const results = await db.run(sql, [fromDate, toDate]);
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

  this.on('activityReport', async (req) => {
    const db = await cds.connect.to('db');

    let { pkgSites = [], createdBys = [] } = req.data;

    const pkgSitePlaceholders = pkgSites.map(() => '?').join(',');
    const createdByPlaceholders = createdBys.map(() => '?').join(',');

    if (pkgSites.length > 0 && createdBys.length === 0) {

      const query1 = `select distinct siteuser.userid from "BATCHPACKRELEASE_DB_T_PACKAGINGSITE"  as site
                            inner join "BATCHPACKRELEASE_DB_T_PACKAGINGSITE_USERS" as siteuser
                            on site.id = siteuser.ps_id  
                            WHERE site.pkgSite IN (${pkgSitePlaceholders}) `;

      const siteResults = await db.run(query1, pkgSites);

      let tempcreatedby = siteResults.map(site => site.USERID);

      createdBys.push(...tempcreatedby);      // Push derived values into initial array

      createdBys = [...new Set(tempcreatedby)];      // Optional: remove duplicates

    }

    if (createdBys.length > 0 && pkgSites.length === 0) {

      const query2 = `select distinct site.PKGSITE from "BATCHPACKRELEASE_DB_T_PACKAGINGSITE"  as site
                            inner join "BATCHPACKRELEASE_DB_T_PACKAGINGSITE_USERS" as siteuser
                            on site.id = siteuser.ps_id  
                            WHERE siteuser.USERID IN (${createdByPlaceholders})`;

      const siteResults = await db.run(query2, createdBys);

      let tempsiteid = siteResults.map(site => site.PKGSITE);

      pkgSites.push(...tempsiteid); // Push derived values into initial array

      pkgSites = [...new Set(tempsiteid)];      // Optional: remove duplicates

    }

    const today = new Date();
    const todaydate = today.toISOString().split('T')[0];
    console.log(pkgSites);
    console.log(createdBys);
    const batchpkgSitePlaceholders = pkgSites.map(() => '?').join(',');
    const batchcreatedByPlaceholders = createdBys.map(() => '?').join(',');

    const query = `SELECT PKGSITE,CREATEDBY,max(CREATEDDATE) as lastActivityDate FROM "BATCHPACKRELEASE_DB_BATCHDATA"
                    where PKGSITE in (${batchpkgSitePlaceholders}) and CREATEDBY in (${batchcreatedByPlaceholders})
                    group by  PKGSITE,CREATEDBY `;

    const params = [...pkgSites, ...createdBys];
    const results = await db.run(query, ...params);

    const response = results.map(r => {

      const date1 = new Date(todaydate);
      const date2 = new Date(r.LASTACTIVITYDATE);

      const diffInMs = date2 - date1; // Difference in milliseconds

      const diffInDays = diffInMs / (1000 * 60 * 60 * 24); // Convert to days

      return {
        packagingSiteID: r.PKGSITE,
        user: r.CREATEDBY,
        lastActivityDate: r.LASTACTIVITYDATE,
        todayDate: todaydate,
        daysFromToday: Math.abs(diffInDays)
      }

    });

    return response;

  });



  this.before('CREATE', M_PackagingSite, async (req) => {
    const { pkgSiteName } = req.data;
    if (!pkgSiteName) return;


    // Check for existing entry with same name
    const existing = await SELECT.one.from(M_PackagingSite).where({ pkgSiteName });

    if (existing) {
      // Optional: throw error or handle gracefully
      req.error(400, `Packaging Site Name "${pkgSiteName}" already exists.`);
      return;
    }

    const result = await SELECT.one`max(ID) as maxID`.from(M_PackagingSite);
    const nextID = (result?.maxID || 0) + 1;

    const rows = await SELECT.from('M_PackagingSite').columns('pkgSite');
    let maxseq = 0;

    for (const row of rows) {
      if (row?.pkgSite && /^[a-z]\d{6}$/i.test(row.pkgSite)) {
        const seq = parseInt(row.pkgSite.slice(1), 10);
        if (seq > maxseq) maxseq = seq;
      }
    }

    const nextSeq = maxseq + 1;

    const prefix = pkgSiteName[0].toLowerCase(); // 'k' from 'Kolkata'

    req.data.pkgSite = prefix + String(nextSeq).padStart(6, '0');
    req.data.ID = nextID;
  });


});