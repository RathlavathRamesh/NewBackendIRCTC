import app from "./app.js";
import dotenv from 'dotenv' 

dotenv.config();
const port = process.env.PORT; 

app.listen(port, async() => {
    try {
        console.log(`Server Running at http://localhost:${port}`);
    }
    catch (err) {
        console.log("Error in connecting to the DB");
    }
})