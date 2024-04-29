const express = require('express');
const router = express.Router();
const session = require('express-session');
const jwt = require('jsonwebtoken');

const adminLayout = '../views/layouts/admin';
const jwtSecret = process.env.JWT_SECRET;

const User = require('../models/user');
const expense = require('../models/expenses')
const expenseGroup = require('../models/expense-group')
const { render } = require('ejs');

const authMiddleware = (req, res, next ) => {
  const token = req.cookies.token;
  if(!token) {
    return res.render('login');
  }
  try { 
    const decoded = jwt.verify(token, jwtSecret);
    req.userId = decoded.userId;
    next();
  } catch(error) {
    res.status(401).json( { message: 'Unauthorized'} );
  }
}


/**
 * GET /
 * Admin - Login Page
*/
router.get('/login', async (req, res) => {
  try {
    const locals = {
      title: "Login Page",
      description: "Simple Blog created with NodeJs, Express & MongoDb."
    }

    res.render('login', { locals, layout: adminLayout });
  } catch (error) {
    console.log(error);
  }
});
/*
Logout
*/
router.get('/logout', (req, res) => {
  res.clearCookie('token');
  res.redirect('/');
});


/**
 * GET /
 * Admin - Register Page
*/
router.get('/signup', async (req, res) => {
  try {
    const locals = {
      title: "Login Page",
      description: "Simple Blog created with NodeJs, Express & MongoDb."
    }

    res.render('signup', { locals, layout: adminLayout });
  } catch (error) {
    console.log(error);
  }
});

/**
 * POST /
 * Admin - Check Login
*/
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const user = await User.findOne( { username } );

    if(!user) {
      res.redirect('/loginfailed');
    }
    else{
      if(user.password != password) {
        res.redirect('/login');
      }
      else{
        const token = jwt.sign({ userId: user._id}, jwtSecret );
        res.cookie('token', token, { httpOnly: true });
        req.session.userName = user.username;
        res.redirect('/dashboard');
      }
    }
  } catch (error) {
    console.log(error);
  }
});

//login failed route
router.get('/loginfailed', async (req, res) => {
  try {
    const locals = {
      title: 'loginfailed',
      description: 'Simple Blog created with NodeJs, Express & MongoDb.'
    }
    res.render('loginfailed', {
      locals,
      layout: adminLayout
    });

  } catch (error) {
    console.log(error);
  }
});
//register failed route
router.get('/registerfailed', async (req, res) => {
  try {
    const locals = {
      title: 'Register Failed',
      description: 'Simple Blog created with NodeJs, Express & MongoDb.'
    }

    res.render('registerfailed', {
      locals,
      layout: adminLayout
    });

  } catch (error) {
    console.log(error);
  }

});
/**
 * POST /
 * Admin - Register
*/
router.post('/register', async (req, res) => {
  try {

    try {
      const user = await User.create({ 
        username: req.body.username, 
        email: req.body.email,
        password: req.body.password,
       });
      res.redirect("/dashboard"); 
    } 
    catch (error) {
      console.log(error)
      res.redirect("/registerfailed");
    }

  } catch (error) {
    console.log(error);
  }
});




/**
 * GET /
 * Dashboard
*/
router.get('/dashboard', authMiddleware, async (req, res) => {
  try {
    const locals = {
      title: 'Dashboard',
      description: 'Simple Blog created with NodeJs, Express & MongoDb.',
      username: req.session.userName
    }
		const data = await expenseGroup.find({ user: req.session.userName });

    
    res.render('dashboard', {
      locals,
      data,
      layout: adminLayout
    });
  } catch (error) {
    console.log(error);
  }

});




router.get('/add-expensegroup', authMiddleware, async (req, res) => {
  try {
    const locals = {
      title: 'Add Expense Group',
      description: 'Simple Blog created with NodeJs, Express & MongoDb.'
    }
    res.render('add-expensegroup', {
      locals,
      layout: adminLayout
    });

  } catch (error) {
    console.log(error);
  }

});

router.post('/add-expensegroup', authMiddleware, async (req, res) => {
  try {
    try {
      const newPost = new expenseGroup({
        user: req.session.userName,
        participants: req.body.participants,
        name: req.body.name,
        date: req.body.date,
      });

      await expenseGroup.create(newPost);
      res.redirect('/dashboard');
    } catch (error) {
      console.log(error);
    }

  } catch (error) {
    console.log(error); 
  }
});
router.get('/expensegroup/:id', authMiddleware, async (req, res) => {
  try {
    const locals = {
      title: 'Expense Splitter',
      description: ''
    }
    const data = await expenseGroup.findById({_id: req.params.id});
    const expenses = await expense.find({expensegroup: data.name});
    let total = 0;
    for (var i = expenses.length - 1; i >= 0; i--) {
      total += parseFloat(expenses[i].cost);
    }
    let payments = [];
    const array = [];
    const balance = [];
    let average = total/data.participants.length;
    for (var j = data.participants.length - 1; j >= 0; j--) {
      let x = 0;
      for (var i = expenses.length - 1; i >= 0; i--) {
        if(expenses[i].payer == data.participants[j]){
          x += parseFloat(expenses[i].cost);
        }
      }
      array.push(data.participants[j]);    
      payments.push(x);
    }

    for (var i = array.length - 1; i >= 0; i--) {
      if(payments[i]<=average){
        continue;
      }
      else{
        for (var j = array.length - 1; j >= 0; j--) {
          if(payments[j] < average){ 
            if(payments[i] - average > average - payments[j]){
            //ortalama 150 olsa bu seçenekte i 300 j 100 harcamış gibi yani i ödeyecek birilerini aramalı
              balance.push(array[j] + " gives "+ (Math.round((average - payments[j])* 100)/100).toFixed(2) +" to "+ array[i]);
              payments[i] =  (Math.round(parseFloat(payments[i] - average + payments[j]) * 100)/100);
              payments[j] = (Math.round(parseFloat(average) * 100)/100);

            }
            else{
            //ortalama 150 olsa bu seçenekte i 200 j 50 harcamış gibi yani i ödeyecek birilerini aramalı
              balance.push(array[j] + " gives "+ (Math.round((payments[i] - average) * 100)/100).toFixed(2) + " to " + array[i]);
              payments[j] = (Math.round(parseFloat(payments[j] + payments[i] - average) * 100)/100);
              payments[i] = (Math.round(parseFloat(average) * 100)/100);
              break;
            }

          }
        }

      }
    }
    res.render('expensegroup', {

      total,
      balance,
      locals,
      data,
      layout: adminLayout
    });

  } catch (error) {
    console.log(error);
  }
});

router.get('/add-expense/:id', authMiddleware, async (req, res) => {
  try {
    const locals = {
      title: 'Add Expense',
      description: ''
    }
    const data = await expenseGroup.findById(req.params.id);

    res.render('add-expense', {
      data,
      locals,
      layout: adminLayout
    });

  } catch (error) {
    console.log(error);
  }
 
});

 
router.post('/add-expense/:id', authMiddleware, async (req, res) => {
  try {
    try {
      const data1 = await expenseGroup.findById(req.params.id);
      const newPost = new expense({
        description: req.body.description,
        expensegroup: data1.name,
        payer: req.body.payer,
        date: req.body.date,
        cost: req.body.cost,
      });

      await expense.create(newPost);
      res.redirect('/expensegroup/' + req.params.id);
    } catch (error) {
      console.log(error);
    }

  } catch (error) {
    console.log(error);
  }
});
 
router.get('/expenses/:id', authMiddleware, async (req, res) => {
  try {
    const locals = {
      title: 'Expense Splitter',
      description: ''
    }
    const data1 = await expenseGroup.findById(req.params.id);
    const data = await expense.find({ expensegroup:  data1.name});
    res.render('expenses', {
      locals,
      data,
      layout: adminLayout
    });

  } catch (error) {
    console.log(error);
  }
});

module.exports = router;