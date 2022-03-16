const express = require('express');
const router = express.Router();

const TokenValidator = require('../middlewares/auth');
const userController = require('../controllers/user.controller');
const fundsController = require('../controllers/funds.controller');

//  users
router.get('/users/', TokenValidator,
    (req, res) => userController.getAllUsers(req, res));

router.get('/users/:email', TokenValidator,
    (req, res) => userController.getUser(req, res));

router.post('/users/',
    (req, res) => userController.createUser(req, res));

router.put('/users/:email', TokenValidator,
    (req, res) => userController.updateUser(req, res));

router.delete('/users/:email', TokenValidator,
    (req, res) => userController.deleteUser(req, res));

// login
router.post('/login/',
    (req, res) => userController.login(req, res));

//  transactions
router.put('/funds/transfer-funds/', TokenValidator,
    (req, res) => fundsController.transferFunds(req, res));

router.put('/funds/fund-acct/', TokenValidator,
    (req, res) => fundsController.fundAcct(req, res));

router.put('/funds/withdraw/', TokenValidator,
    (req, res) => fundsController.withdraw(req, res));

module.exports = router;