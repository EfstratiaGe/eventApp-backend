const UserModel   = require('../models/user');
const bcrypt =  require('bcryptjs');

const getUsers = async (req, res) => {
    const users = await UserModel.find();
        res.send(users);
}

const getUser = async (req, res) => {
    let user = await UserModel.findOne(req.params.email);

    if(!user){
        return res.send({ message: 'This user doesn\'t exist' });
    }
    res.send(user);
}

const createUser = async(req, res) => {
    let user = await UserModel.findOne({name: req.body.name});

    if(user){
        return res.send({ success: false, message: 'User already exist!' });
    }

    const body = req.body;

    const encryptedPassword = await bcrypt.hash(body.password, 8);

    const newUser = {
        "name": body.name,
        "email": body.email,
        "password": encryptedPassword
    }

    await UserModel.create(newUser);

    res.status(201).send(newUser);
}

const deleteUser = async (req, res) =>{
    const user = await UserModel.findById(req.params.id);

    if(!user){
        return res.send({ message: 'This user doesn\'t exist' });
    }
    const email = user.email;
    await UserModel.findByIdAndDelete(req.params.id);
    res.status(201).send("User with "+email+" email was deleted!");
}

const updateUser = async (req, res) =>{
    const user = await UserModel.findById(req.params.id);
    const updates = req.body;

    if(!user){
        return res.send({ message: 'This user doesn\'t exist' });
    }

    await UserModel.findByIdAndUpdate(req.params.id, updates, {new: true})
    const updatedUser = await UserModel.findById(req.params.id);
    res.send(updatedUser);
}

const loginUser = async (req, res) => {
    const {name, password} = req.body;
    const user = await UserModel.findOne({name});
    if(!user){
        res.status(400).send("This user does not exists!");
    }else{
        const isMatch = await bcrypt.compare(password, user.password);
        if(isMatch){
            res.send(user);
        }else{
            res.status(400).send("This password is invalid!");
        } 
    }
}

module.exports = { getUsers, getUser, createUser, deleteUser, updateUser, loginUser };



