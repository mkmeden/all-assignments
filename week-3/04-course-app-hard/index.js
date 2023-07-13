const express = require('express');
const app = express();
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken');

app.use(express.json());

let ADMINS = [];
let USERS = [];
let COURSES = [];

secret_key = 'mkmeden'

const adminSchema = new mongoose.Schema({
  username: String,
  password: String
}
)


const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  purchasedCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'course' }]
})

const courseSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    price: Number,
    imageLink: String,
    published: Boolean
  }
)

const admin = mongoose.model('admin', adminSchema)
const user = mongoose.model('user', userSchema)
const course = mongoose.model('course', courseSchema)


mongoose.connect('{MONGOOSE_URI}/courses', { useNewUrlParser: true, useUnifiedTopology: true });




const authenticateJwt = (req, res, next)=>{

  auth  = req.headers.auth

  if(auth)
  {
    jwt.verify(auth , secret_key, (err , data)=>{
      
      if(err)
      {
        res.status(403)
      }

      else
      {
        req.user = data
        console.log(req.user , typeof(req.user))
        next()
      }
    })
  }

  else
  res.status(401).send()
} 


// Admin routes
app.post('/admin/signup', async (req, res) => {
  // logic to sign up admin

  const { username, password } = req.headers

  let admincheck = await admin.findOne({ username })

  if (admincheck) {
    res.status(403).json({ message: "Admin already exist" })
  }

  else {
    newAdmin = new admin({ username, password })
    await newAdmin.save()

    const token = jwt.sign({ username, password }, secret_key, { expiresIn: '1h' })
    res.json({ message: 'Admin created successfully', token: token })
  }


});

app.post('/admin/login', async (req, res) => {
  // logic to log in admin

  const { username, password } = req.headers

  let admincheck = await admin.findOne({ username, password })

  if (admincheck) {
    token = jwt.sign({ username, password }, secret_key, { expiresIn: '1hr' })

    res.json({ message: 'Logged in successfully', token: token })
  }

  else {

    res.status(404).json({message : 'Authentication failed'})
  }

});

app.post('/admin/courses', async (req, res) => {
  // logic to create a course

  let newCourse  = new course(req.body)

  await newCourse.save()

  res.json({message : 'New course added' , course_id :  newCourse.id })

});

app.put('/admin/courses/:courseId',authenticateJwt ,async (req, res) => {
  // logic to edit a course

  // const course  = await course.findbyIdAndUpdate(req.params.courseId , req.body,  {new : true})

  let updated  = {
     title: req.body.title,
    description: req.body.description, price: req.body.price, imageLink: req.body.imageLink, published: req.body.published
  }
  const courses = await course.findByIdAndUpdate(req.params.courseId, updated, { new: true });


  if(courses)
  {
    res.json({message : 'Course updated successfully'})
  }

  else
  {
    res.status(401).send('Course not found')
  }
  
});

app.get('/admin/courses', async (req, res) => {
  // logic to get all courses

  const courses = await course.find({})
  res.json(courses)
});

// User routes
app.post('/users/signup', async (req, res) => {
  // logic to sign up user
  const { username, password } = req.headers

  let usercheck = await user.findOne({ username })

  if (usercheck) {
    res.status(403).json({ message: "User already exist" })
  }

  else {
    newUser = new user({ username, password })
    await newUser.save()

    const token = jwt.sign({ username, password }, secret_key, { expiresIn: '1h' })
    res.json({ message: 'User created successfully', token: token })
  }


});

app.post('/users/login', async(req, res) => {
  // logic to log in user

  const {username , password}  = req.headers

  const userCheck = await user.findOne({username , password})

  if(userCheck)
  {
    token = jwt.sign({username,  password} , secret_key , {expiresIn : '1h'})
    res.json({message : 'User logged in' , token  : token })
  }

  else
  res.status(404).send('Authentication failed')


});

app.get('/users/courses', authenticateJwt, async(req, res) => {
  // logic to list all courses

  const courses = await course.find({published: true})

  if(courses)
  {
    res.json({courses})
  }

});

app.post('/users/courses/:courseId', authenticateJwt ,async(req, res) => {
  // logic to purchase a course

    let courseId   = req.params.courseId
    const courseProfile = await course.findById(courseId)

    if(courseProfile)
    {
      const username  = req.user.username

      let userProfile = await user.findOne({username})

      if(userProfile)
      {
        userProfile.purchasedCourses.push(courseProfile)
        await userProfile.save()
        res.json({message: 'Course purchased successfully'})
      }

      else
      {
        res.status(403).json({message : 'User not found'})
      }
    }

    else
    {
      res.status(404).json({message : 'Course not found'})
    }




});

app.get('/users/purchasedCourses',authenticateJwt ,async (req, res) => {
  // logic to view purchased courses

  const {username , password} = req.user

  let userProfile = await user.findOne({username}).populate('purchasedCourses')

  if(userProfile)
  {
    res.json({PurchasedCourses : userProfile.purchasedCourses || []})
  }

  else
  {
    res.status(404).json({message : 'User not found'})
  }
 
});

app.listen(3000, () => {
  console.log('Server is listening on port 3000');
});
