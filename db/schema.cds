//schema namespace
namespace batchpackrelease.db;

//importing common aspects
using {
    cuid,
    managed
} from '@sap/cds/common';

//adding isdel into managed aspect
extend managed with {
    isdel : Boolean default false;
};


entity BatchData : cuid, managed {
    key ID          : UUID;
        batchNo     : String(20);
        compCode    : String(20); // pkgSite ID
        pkgSite     : String(50); //package site name
        packingDate : Date;
        releaseDate : Date;
        comments    : String;
        createdDate : Date;
}


entity T_PackagingSite : cuid, managed {
    key ID          : UUID;
        pkgSite     : String(50); //package site id
        pkgSiteName : String(250); //package site Name
        status      : String(10);
        Users       : Composition of many T_PackagingSite_Users
                          on Users.ps = $self;
}

entity T_PackagingSite_Users : cuid, managed {
    key ID     : UUID;
        userId : String(100);
        ps     : Association to T_PackagingSite;
}


entity M_PackagingSite : managed {
    key ID          : Integer;
        pkgSiteName : String(250); //package site Name
        pkgSite     : String(50); //package site id
}

entity ErrorLog : cuid, managed {
    error : String(5000);
    app   : String(100);
    srv   : String(100);
}
