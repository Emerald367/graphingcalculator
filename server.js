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




























































































app.listen(5000, () => console.log(`Server has started on port: ${PORT}`));

module.exports = app