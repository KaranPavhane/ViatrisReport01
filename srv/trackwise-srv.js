const cds = require('@sap/cds');
const common = require('./lib/common');



module.exports = cds.service.impl(async function () {

  const db = await cds.connect.to('db');

  this.on('GetBatchStats', async (req) => {

     const dt = new Date();
     const createdDate = dt.getFullYear() + '-' + common.lpad(dt.getMonth() + 1, 2) + '-' + common.lpad(dt.getDate(), 2);
     const backDate = dt.getFullYear() + '-' + common.lpad(dt.getMonth() + 1, 2) + '-' + common.lpad(dt.getDate()-1, 2);
     var dates = [createdDate,backDate];
     const placeholders = dates.map(() => '?').join(',');
   
    const sql = `WITH BaseData AS (
                SELECT t1.batchNo,t1.compCode,t1.pkgSite,t2.PKGSITENAME,t1.packingDate,t1.releaseDate
                FROM "BATCHPACKRELEASE_DB_BATCHDATA" as t1 inner join "BATCHPACKRELEASE_DB_M_PACKAGINGSITE" as t2 on t1.PKGSITE = T2.PKGSITE
                WHERE t1.CREATEDDATE IN (${placeholders})
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
                TO_CHAR(p.dateFirstUsedInPackaging,'YYYYMMDD') as "Date of First Packaging",TO_CHAR(p.dateLastUsedInPackaging,'YYYYMMDD') as "Date of Last Packaging",
                TO_CHAR(r.firstReleaseDateToMarket,'YYYYMMDD') as "Date of First Release",TO_CHAR(r.lastReleaseDateToMarket,'YYYYMMDD') as "Date of Last Release",
                p.batchFirstUsed "Batch No. of First Packaging",p.batchLastUsed as "Batch No. of Last Packaging",
                fr.batchFirstReleaseToMarket "Batch No. of First Release",fr.batchLastReleaseToMarket as "Batch No. of Last Release"
                FROM FirstLastPacking p JOIN ReleaseStats r
                ON p.compCode= r.compCode AND p.pkgSite= r.pkgSite
                JOIN FirstLastRelease fr
                ON p.compCode= fr.compCode AND p.pkgSite= fr.pkgSite
                ORDER BY p.pkgSite, p.compCode`;

    const results = await db.run(sql,dates);
    return { results };
  });


});





