// user main routes
import { Router } from "express";
import { loginUser, registerUser, logoutUser } from '../controllers/userAuth.controler.js';
import { aboutUpdate, getUserProfile, currentUser, updateAccountDetail, deleteUser } from '../controllers/userprofile.controller.js';
import { userFollowersystem, userUnFollowersystem } from '../controllers/userFollow.controller.js'
import { JwtVerification } from '../middlewares/jwt.auth.js';
import { upload } from '../middlewares/multer.fileuploade.js';
const router = Router();


router.post('/auth/register', upload.fields(
    [
        {
            name: 'avatar',
            maxCount: 1
        },

        {
            name: 'coverImage',
            maxCount: 1
        }
    ]
), registerUser);

router.post('/auth/login', loginUser);
router.get('/auth/logout', JwtVerification, logoutUser);

router.post('/:userid', JwtVerification, aboutUpdate);
router.post("/update-account", JwtVerification, updateAccountDetail);
router.get("/current-user", JwtVerification, currentUser);
router.get('/:username', JwtVerification, getUserProfile);
router.delete('/:userId', JwtVerification, deleteUser);

// router.post('/followers/:id', userFollowersystem);
// router.post('/followers/:id', userUnFollowersystem);
export { router };
