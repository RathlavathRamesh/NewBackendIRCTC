import Router from 'express' 
import { createAdmin,adminLogin,addTrains,updateTrains} from '../controllers/admincontroler.js';
import { verifyUserToken,isAdmin} from '../middlewares/veryfyjwttoken.js';

const router = Router();

// create/add admin
router.post('/createadmin', createAdmin);

//login admin
router.post('/loginadmin', adminLogin);

//add Trains
router.post('/addtrains', verifyUserToken, isAdmin, addTrains);
router.post('/updateseats', verifyUserToken, isAdmin, updateTrains)

export default router;
