//pad with leading zero
function lpad(str, len){
        
    str = str.toString();
    for(let i = 0; i<len;i++){
        if(str.length<len){
            str = '0'+str;
        }else{
            break;
        }
    }
    return str;
        
}

async function logError(cds, message, srv, app) {
    const tx = cds.transaction();
    await tx.run(
        INSERT.into('batchpackrelease.db.ErrorLog').entries({
            error: message,
            app: app,
            srv: srv
        })
    );
    await tx.commit();
}
module.exports = {lpad, logError}
