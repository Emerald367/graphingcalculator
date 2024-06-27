const express = require('express');
const app = express();
app.use(express.json());
const cors = require('cors');
app.use(cors());
const env = require('dotenv').config;
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken');
const supabase = require('./db.js')
const PORT = 5000;
const JWT_Secret = process.env.JWT_SECRET

app.post('/signup', async (req, res) => {
    const { username , password } = req.body;
   
    // Username and password validation
    if (!username || !password ) {
        return res.status(400).json({ error: 'Username and password are required.' });
    }

    try{

        //Check if user already exists
    const { data: existingUser, error: existingUserError } = await supabase
    .from('users')
    .select('id')
    .eq('username', username)
    .single();

    if (existingUserError && existingUserError.code !== 'PGRST116') {
      console.error('Error checking user existence:', existingUserError);
      return res.status(500).json({ error: 'Error checking user existence' });
     }

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const { data: newUser, error: newUserError } = await supabase
      .from('users')
      .insert([
         {
            id: uuidv4(),
            username: username,
            password_hash: hashedPassword,
            created_at: new Date(),
            updated_at: new Date(),
         },
      ])
      .select()
      .single();

     if (newUserError) {
       console.error('Error creating user:', newUserError);
       return res.status(500).json({ error: 'Error creating user.' });
     }

     if (!newUser) {
        console.error('User creationg succeeded but no user data returned');
        return res.status(500).json({error: 'Error craeting user. No user data returned' });
     }

     const token = jwt.sign({ userId: newUser.id}, JWT_Secret, { expiresIn: '1h'});

    res.status(201).json({
      user: { id: newUser.id, username: newUser.username },
      token,
     });
    } catch (error) {
       console.error('Unexpected error occurred:', error);
       res.status(500).json({ error: 'Unexpected error occurred.'});
    }

})

app.post('/login', async (req, res) => {
   const {username, password} = req.body;

   if (!username || !password ) {
      return res.status(400).json({ error: 'Username and password are required.' });
   }

   try {

      const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, username, password_hash')
      .eq('username', username)
      .single();

      if (userError) {
         console.error('Error checking user existence:', userError);
         return res.status(500).json({ error: 'Error checking user existence.' });
      }

      if (!user) {
         return res.status(400).json({error: 'Invalid username or password.' });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password_hash);

      if (!isPasswordValid) {
         return res.status(400).json({ error: 'Invalid username or password.' });
      }

      const token = jwt.sign({ userId: user.id}, JWT_Secret, { expiresIn: '1h'});

      return res.status(200).json({
         user: { id: user.id, username: user.username},
         token,
      })

   } catch (error) {
       console.error('Unexpected error occurred:', error);
       return res.status(500).json({ error: 'Unexpected error occurred.' });
   }
});

const verifyToken = (req, res, next) => {
   const token = req.header('Authorization').replace('Bearer ', '');
   if (!token) {
      return res.status(401).send({ error: 'Access denied. No token provided.' });
   }

   try {
      const decoded = jwt.verify(token, JWT_Secret);
      req.user = decoded;
      next();
   } catch (ex) {
      res.status(400).send({ error: 'Invalid token.' });
   }
};

app.post('/logout', verifyToken, (req, res) => {
   res.status(200).send({ message: 'Logged out successfully' });
})

app.get('/user', verifyToken, async (req, res) => {
     const userId = req.user.userId;

     try {
         const { data: user, error } = await supabase
             .from('users')
             .select('id', 'username')
             .eq('id', userId)
             .single();
         
         if (error) {
            console.error('Error fetching user:', error);
            return res.status(500).json({ error: 'Error fetching user data.' });
         }

         res.json({ user })
     } catch (error) {
         console.error('Unexpected error occurred:', error);
         res.status(500).json({ error: 'Unexpected error occurred.' });
     }
})

app.get('/users', verifyToken, async (req, res) => {
     const userId = req.user.userId;

     try {
         const {data: user, error} = await supabase
             .from('users')
             .select('id, username, created_at')
             .eq('id', userId)
             .single();

      
         if (error) {
            console.error('Error fetching user profile:', error);
            return res.status(500).json({ error: 'Error fetching user profile.' });
         }

         res.json({ user });
     } catch (error) {
         console.error('Unexpected error occurred:', error);
         res.status(500).json({ error: 'Unexpected error occurred.' });
     }
});



























































































app.listen(5000, () => console.log(`Server has started on port: ${PORT}`));

module.exports = app