import Pool from "../config/database.js";
import bcrypt from 'bcrypt'
import { json } from "express";
import jwt from 'jsonwebtoken';

// create admin
const createAdmin = async (req, res) => {
    const { username, password,role} = req.body;
    console.log(username, password,role);
    const [dbUser] = await Pool.query(`select * from users where role=? and username=?`, ['admin',username]);
    if (dbUser.length > 0) {
        return res.status(404).send("admin already exists please login");
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log(hashedPassword);
    const [result] = await Pool.query(`INSERT INTO users(username,password,role) VALUES(?,?,?)`, [username, hashedPassword, role]);
    console.log(result)
    res.status(200).json({ message: "Admin created successfully", AdminId: result.insertId });
}
// login admin
const AdmisSecretKey=process.env.ADMIN_SECRET_TOKEN
const adminLogin = async (req, res) => {
    const { username, password,role } = req.body;
    const payload={username,role}
    const [dbuser] = await Pool.query('select * from users where username=?', [username]);
    if (dbuser.length == 0) {
        res.status(400).json({ message: "Invalid User" });
    }
    const comparePassword = await bcrypt.compare(password, dbuser[0].password);
    if (!comparePassword) {
        return res.status(400).json({ message: "Invalid Password" });
    }
    const jwtToken = await jwt.sign(payload, AdmisSecretKey);
    console.log(jwtToken);
    return res.status(200).json({ message: "Admin logged successfully",jwtToken:jwtToken});
}

// Add trains in the table

const addTrains = async (req, res) => {
    const { train_number, train_name, source, destination, total_seats } = req.body;
    console.log(train_number, train_name, source, destination, total_seats)
    const [dbtrains] = await Pool.query(`select * from trains where train_number=?`, [train_number]);
    if (dbtrains.length > 0) {
        console.log("Train exists");
        return res.status(404).json({ message: `train with the number ${train_number} is alreayy exists` });
    }
    try {
        const [result] = await Pool.query(`INSERT INTO trains(train_number,train_name,source,destination,total_seats,available_seats) VALUES(?,?,?,?,?,?)`, [train_number, train_name, source, destination, total_seats, total_seats]);
        console.log(result);
    return res.status(200).json({ message: "Train added Successfully", TrainId: result.insertId });
    }
    catch (err) {
        return res.status(404).json({ message: err });
    }
    
}
const updateTrains = async (req, res) => {
    const {train_number,updated_seats}=req.body
    const [dbtrain] = await Pool.query(`SELECT * FROM trains where train_number=?`, [train_number]);
    if (dbtrain.length == 0) {
        return res.status(404).json({message:`There are no trains with train_number:${train_number}`})
    }
    if (dbtrain[0].total_seats <updated_seats) {
        return res.status(200).send(`train total seats limit exeding cannot add more seats than ${dbtrain[0].total_seats}`)
    }
    const [result] = await Pool.query(`UPDATE trains SET available_seats=? where train_number=?`, [updated_seats, train_number]);
   return res.status(200).json({ message: 'Train seats updated successfully',result });
}

export {createAdmin,adminLogin,addTrains,updateTrains}