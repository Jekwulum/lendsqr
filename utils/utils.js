require("dotenv").config();

const acct_no_gen = async(dbModel) => {
    let new_acct_no = parseInt(Math.random().toString().slice(2, 11));
    acct_no_Exists = await dbModel(process.env.DB_T_USERS)
        .select("*").where({ account_no: new_acct_no })
        .then(result => { return result[0] })
        .catch(err => { console.log(err); throw err });
    if (!(acct_no_Exists)) {
        return new_acct_no;
    } else {
        acct_no_gen(dbModel);
    };
};

module.exports = acct_no_gen;