const express = require('express');
const router = express.Router();
const {addUser, editUser,deleteUser, getUsers} = require('../controllers/controllerUsers');
const { registerActivities } = require('../controllers/controllerActivitis');
const { searchCustomer } = require('../controllers/controllerSearch');

router.get('/searchCustomer',searchCustomer)
router.get('/getUser',getUsers)
router.post('/addUser',addUser)
router.patch('/editUser/:id',editUser)
router.delete('/deleteUser/:id',deleteUser)
router.patch('/registerActivities/:id',registerActivities);

module.exports = router;