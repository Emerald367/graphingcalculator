const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const env = require('dotenv').config();
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const supabase = require('./db.js');
const { SupabaseClient } = require('@supabase/supabase-js');

const app = express();
const PORT = 5000;
const JWT_Secret = process.env.JWT_SECRET


app.use(cors());
app.use(express.json());
app.use(bodyParser.json());



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


app.post('/graphs', verifyToken, async (req, res) => {
   const userId = req.user.userId;
   const { name, description } = req.body;

   if (!name) {
      return res.status(400).json({ error: 'Graph name is required'});
   }

   try {
      const { data, error } = await supabase
          .from('graphs')
          .insert([{ name, description, user_id: userId}])
          .select()
          .single();

       if (error) {
         console.error('Error creating graph:', error);
         return res.status(500).json({ error: 'Error creating graph' });
       }

       res.status(201).json({ graph: data });
   } catch (error) {
      console.error('Unexpected error occurred:', error);
      res.status(500).json({ error: 'Unexpected error occurred' });
   }
})

app.get('/graphs', verifyToken, async (req, res) => {
   const userId = req.user.userId;

   try {
      const {data, error} = await supabase
          .from('graphs')
          .select('*')
          .eq('user_id', userId);

       if (error) {
         console.error('Error fetching graphs:', error);
         return res.status(500).json({ error: 'Error fetching graphs' });
       }

       res.status(200).json({ graphs: data });
   } catch (error) {
      console.error('Unexpected error occurred', error);
      res.status(500).json({ error: 'Unexpected error occurred' });
   }
});

app.get('/graphs/:id', verifyToken, async (req, res) => {
   const userId = req.user.userId;
   const graphId = req.params.id;

   try {
      const {data, error} = await supabase
          .from('graphs')
          .select('*')
          .eq('user_id', userId)
          .eq('id', graphId)
          .single();

       if (error) {
         console.error('Error fetching graph:', error);
         return res.status(500).json({ error: 'Error fetching graph '});
       }

       if (!data) {
         return res.status(404).json({ error: 'Graph not found' });
       }

       res.status(200).json({ graph: data });
   } catch (error) {
      console.error('Unexpected error occurred:', error);
      res.status(500).json({ error: 'Unexpected error occurred' });
   }
});

app.put('/graphs/:id', verifyToken, async (req, res) => {
    const userId = req.user.userId;
    const graphId = req.params.id;
    const { name, description } = req.body;

    if (!name || !description) {
      return res.status(400).json({ error: 'Name and description are required' });
    }

    try {
      const {data, error} = await supabase
          .from('graphs')
          .update({ name, description, updated_at: new Date().toISOString() })
          .eq('user_id', userId)
          .eq('id', graphId)
          .select()
          .single();

      if (error) {
         console.error('Error updating graph', error);
         return res.status(500).json({ error: 'Error updating graph' });
      }

      res.status(200).json({ graph: data});
    } catch (error) {
      console.error('Unexpected error occurred:', error);
      res.status(500).json({ error: 'Unexpected error occurred' });
    }
});

app.delete('/graphs/:id', verifyToken, async (req, res) => {
   const userId = req.user.userId;
   const graphId = req.params.id;

   try {
      const { data, error } = await supabase
          .from('graphs')
          .delete()
          .eq('user_id', userId)
          .eq('id', graphId);

      if (error) {
         console.error('Error deleting graph:', error);
         return res.status(500).json({ error: 'Error deleting graph' });
      }

      if (data.length === 0) {
         return res.status(404).json({ error: 'Graph not found' });
      }

      res.status(200).json({ message: 'Graph deleted successfully' });
   } catch (error) {
      console.error('Unexpected error occurred:', error)
      res.status(500).json({ error: 'Unexpected error occurred' });
   }
})

app.post('/graphs/equations', verifyToken, async (req, res) => {
   const userId = req.user.userId;
   const { equation, color, thickness} = req.body;

   if (!equation || !color || thickness == null) {
      return res.status(400).json({ error: 'Equation is required' });
   }

   if (!validateEquation(equation)) {
      return res.status(400).json({ error: 'Invalid equation format'});
   }

   const id = uuidv4();

    try {
       const { data, error } = await supabase
           .from('equations')
           .insert([{equation, color, id, thickness }])
           .select()
           .single();

       if (error) {
         console.error('Error adding equation:', error);
         return res.status(500).json({ error: 'Error creating equation' });
       }
       
       res.status(201).json({ equation: data });

    } catch (error) {
        console.error('Unexpected error occurred:', error);
        res.status(500).json({ error: 'Unexpected error occurred' });
    }
   
});

const validateEquation = (equation) => {
   const linearRegex = /^y\s*=\s*[+-]?\d*x\s*([+-]\s*\d+)?$/;
   const quadraticRegex = /^y\s*=\s*[+-]?\d*x\^2\s*([+-]\s*\d*x\s*)?([+-]\s*\d+)?$/;
   const polynomialRegex = /^y\s*=\s*[+-]?\d*x\^\d+(\s*[+-]\s*\d*x\^\d+)*(\s*[+-]\s*\d+)?$/;
   const exponentialRegex = /^y\s*=\s*[+-]?\d*\^\(x\)\s*([+-]\s*\d+)?$/;
   const logarithmicRegex = /^y\s*=\s*log\(\d*\s*x\)\s*([+-]\s*\d+)?$/;
   const trigonometricRegex = /^y\s*=\s*(sin|cos|tan)\(x\)\s*([+-]\s*\d+)?$/;
   const conicSectionsRegex = /^(\d*\s*x\^2\s*[+-]\s*\d*\s*y\^2\s*=\s*\d+)$/;
   const rationalRegex = /^y\s*=\s*\d*x\/\d+(\s*[+-]\s*\d+)?$/;
   const circleRegex = /^\s*\(x\s*[+-]\s*\d+\)\^2\s*[+-]\s*\(y\s*[+-]\s*\d+\)\^2\s*=\s*\d+$/;

   const regexes = [
      linearRegex,
      quadraticRegex,
      polynomialRegex,
      exponentialRegex,
      logarithmicRegex,
      trigonometricRegex,
      conicSectionsRegex,
      rationalRegex,
      circleRegex
   ]

   return regexes.some((regex) => regex.test(equation));
};

app.put('/graphs/equations/:id', verifyToken, async (req, res) => {
   const userId = req.user.userId;
   const { id } = req.params;
   const {equation, color, thickness} = req.body;

   if (!equation || !color || thickness == null) {
      return res.status(400).json({ error: 'Equation, color, and thickness are required'})
   }

   if (!validateEquation(equation)) {
      return res.status(400).json({ error: 'Invalid equation format'});
   }

   try {
      const { data, error } = await supabase
          .from('equations')
          .update({ equation, color, thickness })
          .eq('id', id)
          .select()
          .single();

      if (error) {
         console.error('Error updating equation', error);
         return res.status(500).json({ error: 'Error updating equation' });
      }

      res.status(200).json({ equation: data });
   } catch (error) {
      console.error('Unexpected error occurred:', error);
      res.status(500).json({ error: 'Unexpected error occurred' });
   }
})

app.delete('/graphs/equations/:id', verifyToken, async (req, res) => {
   const { id } = req.params;
   console.log('Delete request received for ID:', id);

   try {
      const {data, error} = await supabase
          .from('equations')
          .delete()
          .eq('id', id)

      if (error) {
         console.error('Error deleting equation:', error);
         return res.status(500).json({ error: 'Error deleting equation' });
      }

      res.status(200).json({ message: 'Equation deleted successfully', equation: data })
   } catch (error) {
      console.error('Unexpected error occurred:', error);
      res.status(500).json({ error: 'Unexpected error occurred' });
   }
});

app.post('/public/graphs/equations', async (req, res) => {
   const { equation, color, thickness } = req.body;

   if (!equation || !color || thickness == null) {
      return res.status(400).json({ error: 'Equation is required' });
   }

   if (!validateEquation(equation)) {
      return res.status(400).json({ error: 'Invalid equation format' });
   }

   const id = uuidv4();

   try {
      const { data, error } = await supabase
         .from('equations')
         .insert([{ equation, color, id, thickness }])
         .select()
         .single();

      if (error) {
         console.error('Error adding equation:', error);
         return res.status(500).json({ error: 'Error creating equation' });
      }

      res.status(201).json({ equation: data });

   } catch (error) {
      console.error('Unexpected error occurred:', error);
      res.status(500).json({ error: 'Unexpected error occurred' });
   }
});

app.put('/public/graphs/equations/:id', async (req, res) => {
   const { id } = req.params;
   const { equation, color, thickness } = req.body;

   if (!equation || !color || thickness == null) {
      return res.status(400).json({ error: 'Equation, color, and thickness are required' });
   }

   if (!validateEquation(equation)) {
      return res.status(400).json({ error: 'Invalid equation format' });
   }

   try {
      const { data, error } = await supabase
         .from('equations')
         .update({ equation, color, thickness })
         .eq('id', id)
         .select()
         .single();

      if (error) {
         console.error('Error updating equation:', error);
         return res.status(500).json({ error: 'Error updating equation' });
      }

      res.status(200).json({ equation: data });
   } catch (error) {
      console.error('Unexpected error occurred:', error);
      res.status(500).json({ error: 'Unexpected error occurred' });
   }
});

app.delete('/public/graphs/equations/:id', async (req, res) => {
   const { id } = req.params;
   console.log('Delete request received for ID:', id);

   try {
      const { data, error } = await supabase
         .from('equations')
         .delete()
         .eq('id', id);

      if (error) {
         console.error('Error deleting equation:', error);
         return res.status(500).json({ error: 'Error deleting equation' });
      }

      res.status(200).json({ message: 'Equation deleted successfully', equation: data });
   } catch (error) {
      console.error('Unexpected error occurred:', error);
      res.status(500).json({ error: 'Unexpected error occurred' });
   }
});































































































app.listen(5000, () => console.log(`Server has started on port: ${PORT}`));

module.exports = app