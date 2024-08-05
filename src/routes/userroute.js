//userrouter.js
import { Router } from 'express' 
import { createUser, loginUser, getTrains,BookTrains,bookings} from '../controllers/usercontroler.js'
import { verifyUserToken } from '../middlewares/veryfyjwttoken.js';
const router = Router();

//create or add new user in the website
router.post('/register', createUser);

//login the user
router.post('/login', loginUser);

//Check Available trains and Seats 
router.post('/checktrains', verifyUserToken, getTrains)
router.post('/bookTrains', verifyUserToken, BookTrains)
router.post('/bookings',verifyUserToken, bookings);


export default router;