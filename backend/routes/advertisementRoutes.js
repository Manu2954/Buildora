const express = require('express');
const router = express.Router();
const { getAds, createAd, updateAd, deleteAd } = require('../controllers/admin/advertisementController');
const { adminAuth } = require('../middleware/adminAuth');

router.use(adminAuth);
router.route('/').get(getAds).post(createAd);
router.route('/:id').put(updateAd).delete(deleteAd);

module.exports = router;