using {batchpackrelease.db as my} from '../db/schema';

//using {sap.changelog as changelog} from '@cap-js/change-tracking'; // <-- Added


service DocumentService @(impl: './superUser-srv.js') {

    // Project ChangeLog into this service
  //  entity ChangeLog             as projection on changelog.ChangeLog;

    entity BatchData             as projection on my.BatchData;

    entity ErrorLog              as projection on my.ErrorLog;

    annotate DocumentService.BatchData with {
        batchNo     @changelog;
        compCode    @changelog;
        pkgSite     @changelog;
        packingDate @changelog;
        releaseDate @changelog;
        comments    @changelog;
    }


    action BatchUpload(BatchLoad: array of BatchData)       returns String;

    action BatchUpload_New(BatchLoad: array of BatchData)   returns String;

    action GetTrackwiseReport(fromDate: Date, toDate: Date) returns String;

    entity T_PackagingSite       as projection on my.T_PackagingSite
                                    where
                                        isdel = false;

    entity T_PackagingSite_Users as projection on my.T_PackagingSite_Users
                                    where
                                        isdel = false;


    entity M_PackagingSite       as projection on my.M_PackagingSite;

    action convertExcelToCsv(file: LargeString)             returns {
        csvText : LargeString;
        message : String;
    };

    action activityReport(pkgSites: array of String,
                          createdBys: array of String)      returns array of {
        pkgSite          : String;
        createdBy        : String;
        lastActivityDate : Date;
        todayDate        : Date;
        daysFromToday    : Integer;
    };

    entity AuditTrial            as projection on my.BatchData;


}


service CMOService @(impl: './cmo-srv.js') {

    entity ErrorLog              as projection on my.ErrorLog;

    entity T_PackagingSite       as projection on my.T_PackagingSite
                                    where
                                        isdel = false;

    entity T_PackagingSite_Users as projection on my.T_PackagingSite_Users
                                    where
                                        isdel = false;

    entity M_PackagingSite       as projection on my.M_PackagingSite;
    entity BatchData             as projection on my.BatchData;

    action BatchUpload(BatchLoad: array of BatchData)       returns String;

    action BatchUpload_New(BatchLoad: array of BatchData)   returns String;

    action convertExcelToCsv(file: LargeString)             returns {
        csvText : LargeString;
        message : String;
    };

}

service TrackwiseService @(impl: './trackwise-srv.js') {
    function GetBatchStats()                                returns String;

}
