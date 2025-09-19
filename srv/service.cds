using { mydb as db } from '../db/schema';

service MyService {

    entity Customer as projection on db.Customer;

}
