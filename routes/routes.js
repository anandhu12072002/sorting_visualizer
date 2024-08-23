const { Router } = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/users');

const router = Router();

router.post('/register', async (req, res) => {
    try {
        let { email, password, name } = req.body;

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Check if the email already exists
        const record = await User.findOne({ email: email });
        if (record) {
            return res.status(400).send({
                message: "Email is already registered"
            });
        }

        // Create a new user and save it
        const user = new User({
            name: name,
            email: email,
            password: hashedPassword
        });

        const result = await user.save();

        // Generate a JWT token
        const { _id } = result.toJSON();
        const token = jwt.sign({ _id: _id }, "secret", {
            expiresIn: "1d"
        });

        // Set the JWT as a cookie
        res.cookie("jwt", token, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000 // 1 day
        });

        // Send a success message
        res.send({
            message: "Registration successful"
        });
    } catch (error) {
        // Handle errors
        res.status(500).send({
            message: "Internal Server Error",
            error: error.message
        });
    }
});

router.post('/login', async (req, res) => {
    const user = await User.findOne({email: req.body.email})
    if(!user) {
        return res.status(404).send({
            message: "User not Found"
        })
    }

    if(!(await bcrypt.compare(req.body.password, user.password))) {
       return res.status(400).send({
        message: "Password is Incorrect",
       });
    }
    const token = jwt.sign({_id:user._id}, "secret");

    res.cookie("jwt", token, {
        httpOnly: true,
        maxAge: 24*60*60*1000 //for 1 day
    });
    res.send ({
        message: "success"
    });

});

router.get('/user', async (req, res) => {
    try{
        const cookie = req.cookies['jwt'];
        const claims = jwt.verify(cookie, "secret");

        if(!claims) {
            return res.status(401).send({
                message: "unauthenticated"
            })
        }
        const user = await User.findOne({_id: claims._id});
        const {password,...data} = await user.toJSON();
        res.send(data);
    }
    catch(err){
        return res.status(401).send({
            message: "unauthenticated"
        })
    }
});

router.post('/logout', (req, res) => {
    res.cookie("jwt", "", {maxAge: 0});
    res.send({
        message: "success"
    })
});

module.exports = router;
