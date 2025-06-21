const express = require('express');
const router  = express.Router();
const expressAsyncHandler = require('express-async-handler');
const { getUsers, getUser, createUser, deleteUser, updateUser, loginUser } = require('../controllers/user.controller.js');


router.post("/login",expressAsyncHandler(loginUser));

router.post("/", expressAsyncHandler(createUser));

router.get("/", expressAsyncHandler(getUsers));

router.get("/:id", expressAsyncHandler(getUser));

router.delete("/:id",expressAsyncHandler(deleteUser));

router.put("/:id", expressAsyncHandler(updateUser));

module.exports = router;