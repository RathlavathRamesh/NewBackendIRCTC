//usercontroller.js
import Pool from "../config/database.js";
import bcrypt from 'bcrypt'
import { use } from "bcrypt/promises.js";
import jwt from 'jsonwebtoken';

const SecretKey = process.env.USER_SECRET_TOKEN;

const createUser = async (req, res) => {
    const { username, password, role } = req.body;
    console.log(req.body);
    try {
        const [dpUser] = await Pool.query(`select * from users where username=?`, [username]);
        console.log(dpUser)
        if (dpUser.length>0) {
            return res.status(404).json({ message: "user already exists" });
        }
       const hashedPassword = await bcrypt.hash(password, 10);
       const [result] = await Pool.query(
            'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
            [username, hashedPassword, role]
        );
        res.status(201).json({ message: 'User created successfully', userId: result.insertId });
    }
    catch (err) {
        res.status(500).send(err);
    }  
}
const loginUser = async (req, res) => {
    const { username, password } = req.body;
    console.log(username, password);
    try {
        const [dbUser] = await Pool.query(`select * from users where username=?`, [username]);
        if (dbUser.length == 0) {
            return res.status(201).json({ message: "Invalid User" });
        }
        const userrole = dbUser[0].role
        console.log(dbUser[0].id);
        const payload = { username, role:userrole,user_id:dbUser[0].id}
        const comparePassword = await bcrypt.compare(password, dbUser[0].password);
        if (comparePassword===false){
            return res.status(201).json({ message: "Invalid password" });
        }
       const jwtToken = jwt.sign(payload, SecretKey)
        return res.status(201).json({ message: "User logged successfully",jwtToken:jwtToken,userrole});
    }
    catch (err) {
        console.log("Error Occured");
    }
}


const getTrains = async (req, res) => {
    const { fromtrain, toTrain } = req.body;
    console.log(fromtrain, toTrain);
     if (!fromtrain || !toTrain) {
         return res.status(400).json({message:"Source and destination are required."});
    }
    try {
       console.log(fromtrain, toTrain);
        const [trains] = await Pool.query(`SELECT * from trains where source LIKE ? and destination LIKE ?`, [`%${fromtrain}%`, `%${toTrain}%`]);
        console.log(trains);
        res.status(201).send({ trains: trains });
    }
    catch (err) { 
        return res.status(500).json(err);
    }
}

const BookTrains = async (req, res) => {
    const { train_number, seats } = req.body;
    console.log("book trains logic write here");
    const { user_id } = req.user;
    console.log(train_number, user_id);
    console.log(seats);
     try {
        await Pool.query('START TRANSACTION');

        // Check if enough seats are available
        const [train] = await Pool.query(`
            SELECT available_seats FROM trains 
            WHERE train_number = ? AND available_seats >= ?;
        `, [train_number, seats]);

        if (train.length === 0) {
            await Pool.query('ROLLBACK');
            return res.status(400).send('Not enough available seats or train not found');
        }

        // Update the available seats
        const [result] = await Pool.query(`
            UPDATE trains 
            SET available_seats = available_seats - ? 
            WHERE train_number = ?;
        `, [seats, train_number]);

        if (result.affectedRows === 0) {
            await Pool.query('ROLLBACK');
            return res.status(400).send('Error updating available seats');
        }

        // Get the train ID
        const [trainIdResult] = await Pool.query(`
            SELECT id FROM trains 
            WHERE train_number = ?;
        `, [train_number]);

        const train_id = trainIdResult[0].id;

        // Insert the booking
        await Pool.query(`
            INSERT INTO bookings (user_id, train_id, seats_booked)
            VALUES (?, ?, ?);
        `, [user_id, train_id, seats]);

        await Pool.query('COMMIT');
         res.status(200).json({ message: 'Booking successful' });
    } catch (error) {
        await Pool.query('ROLLBACK');
        console.error('Error booking train:', error);
        res.status(500).send('Internal Server Error');
    }
}
const bookings = async (req,res) => {
    const { user_id } = req.user;
    console.log(user_id);
    const [result] = await Pool.query(`SELECT * from bookings where user_id=?`, [user_id]);
    console.log(result);
    if (result.length == 0) {
        return res.status(500).json({ message: "No Bookings found" });
    }
    try { 
       const [trains] = await Pool.query('Select * from trains,bookings where trains.id=bookings.train_id and bookings.user_id=?', [user_id]);
        console.log(trains);
        return res.status(201).json({ message: "Bookings fetched", trains: trains });
    }
    catch (err){
        console.log(err);
        res.status(500).send({ message: err });
    } 
    res.status(200).send("bookings page called");
}

export {createUser,loginUser,getTrains,BookTrains,bookings}