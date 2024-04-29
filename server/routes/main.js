const express = require('express');
const router = express.Router();
const expenses = require('../models/expenses')
const User = require('../models/user');



//Home Route
router.get('/', async (req,res) => {
	const locals = {
		title: "CENGden",
		description: "An online marketplace application"
	};
	try{
		res.render('homepage', {locals});
	}catch(err){
		console.log(err);
	}
});

module.exports = router;