require('dotenv').config();
const db = require('../config/database');
const bcrypt = require('bcryptjs');

const FundsController = {
    fundAcct: async(req, res) => {
        const { receiver_acct_no, amount } = req.body;
        if (!(receiver_acct_no && amount)) {
            return res.status(400).json("Enter all required inputs");
        };
        if (amount <= 0) {
            return res.status(400).json("Enter valid amount");
        };
        acctExists = await db(process.env.DB_T_USERS).select("*").where({ account_no: receiver_acct_no })
            .then(result => { return result[0] })
            .catch((err) => { console.log(err); throw err });
        if (!(acctExists)) {
            return res.status(400).json("account does not exist");
        };

        await db(process.env.DB_T_USERS)
            .where({ account_no: receiver_acct_no })
            .update({ amount: acctExists.amount + amount })
            .then(() => {
                db(process.env.DB_T_USERS)
                    .where({ account_no: receiver_acct_no })
                    .select("user_id", "first_name", "last_name", "email", "amount")
                    .then(response => res.status(200).json({ data: response, message: "successful" }))
                    .catch(err => res.status(404).json(err));
            })
            .catch(err => res.status(404).json({ message: "user not found", error: err }));
    },

    transferFunds: async(req, res) => {
        const { sender_acct_no, receiver_acct_no, amount, transaction_pin } = req.body;
        if (!(sender_acct_no, receiver_acct_no && amount && transaction_pin)) {
            return res.status(400).json("Enter all required inputs");
        };
        if (amount <= 0) {
            return res.status(400).json("Enter valid amount");
        };
        receiver_acctExists = await db(process.env.DB_T_USERS).select("*").where({ account_no: receiver_acct_no })
            .then(result => { return result[0] })
            .catch((err) => { console.log(err); throw err });
        if (!(receiver_acctExists)) {
            return res.status(400).json("receiver account does not exist");
        };
        sender_acctExists = await db(process.env.DB_T_USERS).select("*").where({ account_no: sender_acct_no })
            .then(result => { return result[0] })
            .catch((err) => { console.log(err); throw err });
        if (!(sender_acctExists)) {
            return res.status(400).json("sender account does not exist");
        };
        if (sender_acctExists.amount < amount) {
            return res.status(400).json("insufficient funds");
        };
        if (!(await bcrypt.compare(String(transaction_pin), sender_acctExists.transaction_pin))) {
            return res.status(400).json("incorrect pin");
        };


        await db(process.env.DB_T_USERS)
            .where({ account_no: receiver_acct_no })
            .update({ amount: receiver_acctExists.amount + amount })
            .then(async() => {
                await db(process.env.DB_T_USERS)
                    .where({ account_no: sender_acct_no })
                    .update({ amount: sender_acctExists.amount - amount })
                    .then(async() => {
                        db(process.env.DB_T_USERS)
                            .where({ account_no: sender_acct_no })
                            .select("user_id", "first_name", "last_name", "email", "amount")
                            .then(response => res.status(200).json({ data: response, message: "transaction successful" }))
                            .catch(err => res.status(404).json(err));
                    })
                    .catch(err => res.status(404).json({ message: "user not found", error: err }));
            })
            .catch(err => res.status(404).json({ message: "user not found", error: err }));
    },
    withdraw: async(req, res) => {
        const { acct_no, amount, transaction_pin } = req.body;
        if (!(acct_no && amount && transaction_pin)) {
            return res.status(400).json("Enter all required inputs");
        };
        if (amount <= 0) {
            return res.status(400).json("Enter valid amount");
        };
        acctExists = await db(process.env.DB_T_USERS).select("*").where({ account_no: acct_no })
            .then(result => { return result[0] })
            .catch((err) => { console.log(err); throw err });
        if (!(acctExists)) {
            return res.status(400).json("account does not exist");
        };
        if (acctExists.amount < amount) {
            return res.status(400).json("insufficient funds");
        };
        if (!(await bcrypt.compare(String(transaction_pin), acctExists.transaction_pin))) {
            return res.status(400).json("incorrect pin");
        };

        await db(process.env.DB_T_USERS)
            .where({ account_no: acct_no })
            .update({ amount: acctExists.amount - amount })
            .then(() => {
                db(process.env.DB_T_USERS)
                    .where({ account_no: acct_no })
                    .select("user_id", "first_name", "last_name", "email", "amount")
                    .then(response => res.status(200).json({ data: response, message: "successful" }))
                    .catch(err => res.status(404).json(err));
            })
            .catch(err => res.status(404).json({ message: "user not found", error: err }));
    }
};

module.exports = FundsController;