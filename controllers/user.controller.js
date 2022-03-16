require('dotenv').config();
const acct_no_gen = require('../utils/utils');
const db = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");

const UserController = {
    login: async(req, res) => {
        const { email, password } = req.body;
        if (!(email && password)) {
            res.status(400).json("Enter all required inputs");
        };
        userExists = await db(process.env.DB_T_USERS).select("*").where('email', email)
            .then(row => { return row[0] })
            .catch((err) => { console.log(err); throw err });

        if (userExists && await bcrypt.compare(password, userExists.user_password)) {
            const token = await jwt.sign({ email },
                process.env.TOKEN_KEY, {
                    expiresIn: "1h",
                }
            );

            await db(process.env.DB_T_USERS)
                .where({ email: email })
                .update({ token: token })
                .then(() => {
                    db(process.env.DB_T_USERS)
                        .where({ email: email })
                        .select("user_id", "first_name", "last_name", "email", "token")
                        .then(response => res.status(200).json({ data: response, message: "user successfully logged in" }))
                        .catch(err => res.status(404).json(err));
                })
                .catch(err => res.status(404).json({ message: "user not found", error: err }));
        } else {
            return res.status(404).json("incorrect details");
        };
    },
    createUser: async(req, res) => {
        const { first_name, last_name, email, password, confirmPassword, amount, transaction_pin } = req.body;
        if (!(email && password && confirmPassword && first_name && last_name && transaction_pin)) {
            return res.status(400).json("Enter all required inputs");
        };
        if (password !== confirmPassword) {
            return res.status(400).json("passwords do not match");
        };
        if (amount <= 0 || amount === "") {
            amount = 0;
        };

        userExists = await db(process.env.DB_T_USERS).select("email").where('email', email)
            .then((rows) => {
                for (row of rows) {
                    return row['email'];
                }
            })
            .catch((err) => { console.log(err); throw err });
        if (userExists) {
            return res.status(400).json("userExists");
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const hashedPin = await bcrypt.hash(String(transaction_pin), 10);
        const token = jwt.sign({ email: email }, process.env.TOKEN_KEY, { expiresIn: "1h" });
        const new_acct_no = await acct_no_gen(db);

        await db(process.env.DB_T_USERS).insert({
                first_name: first_name,
                last_name: last_name,
                email: email,
                user_password: hashedPassword,
                account_no: new_acct_no,
                transaction_pin: hashedPin,
                token: token,
                amount: amount
            })
            .then(response => {
                return res.status(201).json({ message: "user successfully added" })
            })
            .catch(err => {
                console.log("error: ", err);
                return res.status(500).json("an error occured");
            });
    },

    getAllUsers: async(req, res) => {
        await db(process.env.DB_T_USERS)
            .select("user_id", "first_name", "last_name", "email", "account_no", "amount", "created_at")
            .then(response => res.status(200).json(response))
            .catch(err => res.status(400).json(err));
    },

    getUser: async(req, res) => {
        await db(process.env.DB_T_USERS)
            .where({ email: req.params.email })
            .select("user_id", "first_name", "last_name", "email", "account_no", "amount", "created_at")
            .then(response => res.status(200).json(response))
            .catch(err => res.status(404).json({ message: "not found", error: err }));
    },

    updateUser: async(req, res) => {
        if (req.body.amount || req.body.created_at || req.body.email || req.body.account_no) {
            return res.status(403).json("cannot update amount, account number, date created and email");
        }
        await db(process.env.DB_T_USERS)
            .where({ email: req.params.email })
            .update(req.body)
            .then(() => {
                db(process.env.DB_T_USERS)
                    .where({ email: req.params.email })
                    .select("user_id", "first_name", "last_name", "email", "transaction_pin")
                    .then(response => res.status(201).json({ data: response, message: "user successfully updated" }))
                    .catch(err => res.status(404).json(err));
            })
            .catch(err => res.status(404).json({ message: "user not found", error: err }));
    },

    deleteUser: async(req, res) => {
        userExists = await db(process.env.DB_T_USERS).select("email").where('email', req.params.email)
            .then((rows) => {
                for (row of rows) {
                    return row['email'];
                }
            })
            .catch((err) => { console.log(err); throw err });
        if (!(userExists)) {
            return res.status(400).json("user does not exist");
        }
        await db(process.env.DB_T_USERS)
            .where({ email: req.params.email })
            .del()
            .then(() => res.status(200).json("user successfully deleted"))
            .catch(err => res.status(404).json({ error: err, message: "user not found" }));
    }
}

module.exports = UserController;