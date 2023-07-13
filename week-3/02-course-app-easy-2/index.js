const express = require('express');
const jwt = require('jsonwebtoken')
const app = express();
const fs = require('fs')

app.use(express.json());

let ADMINS = [];
let USERS = [];
let COURSES = [];

secret_key = 'mkmeden'

// Admin routes

const generateJWT = (admin) =>{

  return jwt.sign(admin ,secret_key , {expiresIn : '1h'})

}

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

app.post('/admin/signup', (req, res) => {
  // logic to sign up admin

  username = req.headers.username
  password = req.headers.password

  console.log(username , password)

  fs.readFile('02-course-app-easy-2/admin.json', 'utf8', (err, data) => {

    ADMINS = JSON.parse(data)
    console.log(ADMINS)
    admin_id = Math.floor(Math.random() * 10000)

    check = ADMINS.find((x)=> x.username === username && x.password === password)

    if(check)
    res.status(403).json({ message: 'Admin already exists' });


    else
    {
      ADMINS.push({ admin_id: admin_id, username: username, password: password })
      console.log(ADMINS)
      token = generateJWT({username : username , password : password})

      fs.writeFile('02-course-app-easy-2/admin.json', JSON.stringify(ADMINS), (err) => {
        if (err)
          res.status(404).send()
  
        else
        res.json({ message: 'Admin created successfully' , token : token});

      })
    }

  })


});

app.post('/admin/login', (req, res) => {
  // logic to log in admin

  username = req.headers.username
  password = req.headers.password

  fs.readFile('02-course-app-easy-2/admin.json' , 'utf8' , (err , data)=>{

    ADMINS = JSON.parse(data)
console.log(ADMINS)
    check = ADMINS.find((x) => x.username === username && x.password === password)

    if(check)
    {
      token = generateJWT({username : username , password : password})
      res.json({message : 'Successfully logged in' , token : token})

    }

    else
    {
      res.status(403).json({ message: 'Admin authentication failed' });
    }

  })
});

app.post('/admin/courses',authenticateJwt ,(req, res) => {
  // logic to create a course


  let title = req.body.title
  let description = req.body.description
  let price = req.body.price
  let imageLink = req.body.imageLink
  let published = req.body.published

  let courseID = Math.floor(Math.random() * 10000)

  fs.readFile('02-course-app-easy-2/courses.json', 'utf8', (err, data) => {

    COURSES = JSON.parse(data)
    COURSES.push({
      username: req.user.username, courseID: courseID, title: title,
      description: description, price: price, imageLink: imageLink, published: published
    })

    fs.writeFile('02-course-app-easy-2/courses.json', JSON.stringify(COURSES), (err) => {
      if (err)
        res.status(404).send()

      else
      res.json({ message: 'Course created successfully', courseId: courseID });

    })
  })
     

});

app.put('/admin/courses/:courseId', authenticateJwt, (req, res) => {
  // logic to edit a course

  let courseID = Number(req.params.courseId)
  console.log(courseID)

      fs.readFile('02-course-app-easy-2/courses.json', 'utf8', (err, data) => {

        COURSES = JSON.parse(data)

        let index = -1

        for (let i = 0; i < COURSES.length; i++) {
          if (COURSES[i].courseID === courseID) {
            index = i
            break
          }
        }

        if (index != -1) {
          COURSES[index].title = req.body.title
          COURSES[index].description = req.body.description
          COURSES[index].price = req.body.price
          COURSES[index].imageLink = req.body.imageLink
          COURSES[index].published = req.body.published

          fs.writeFile('02-course-app-easy-2/courses.json', JSON.stringify(COURSES), (err) => {

            if (err)
              res.status(404).send('writing error')

            else
            res.json({ message: 'Course updated successfully' });
          })
        }

        else
        res.status(404).json({ message: 'Course not found' });

      })



});

app.get('/admin/courses', (req, res) => {
  // logic to get all courses

  fs.readFile('02-course-app-easy-2/courses.json', 'utf8', (err, data) => {

    COURSES = JSON.parse(data)

    res.json({ courses: COURSES });

  })

});

// User routes
app.post('/users/signup', (req, res) => {
  // logic to sign up user

  username = req.headers.username
  password =  req.headers.password

  fs.readFile('02-course-app-easy-2/users.json' , 'utf8' , (err , data)=>{

    USERS = JSON.parse(data)
    user_id = Math.floor(Math.random() * 10000)
  
    check = USERS.find((x)=> x.username ===username && x.password===password)
  
    if(check)
    res.status(403).json({ message: 'User already exists' });
  
    else
    {
      USERS.push({ user_id: user_id, username: username, password: password , purchasedCourses :[]})
      token = generateJWT({username : username , password : password})
      fs.writeFile('02-course-app-easy-2/users.json', JSON.stringify(USERS), (err) => {
        if (err)
          res.status(404).send()
  
        else
        res.json({ message: 'User created successfully' , token : token });
  
      })
  
    }
  })

});

app.post('/users/login', (req, res) => {
  // logic to log in user

  
  username = req.headers.username
  password = req.headers.password

  fs.readFile('02-course-app-easy-2/users.json' , 'utf8' , (err , data)=>{

    USERS = JSON.parse(data)
console.log(USERS)
    check = USERS.find((x) => x.username === username && x.password === password)

    if(check)
    {
      token = generateJWT({username : username , password : password})
      res.json({message : 'Successfully logged in' , token : token})

    }

    else
    {
      res.status(403).json({ message: 'Admin authentication failed' });
    }

  })


});

app.get('/users/courses', authenticateJwt,(req, res) => {
  // logic to list all courses
  fs.readFile('02-course-app-easy-2/courses.json', 'utf8', (err, data) => {

    COURSES = JSON.parse(data)

    res.json({ courses: COURSES });

  })


});

app.post('/users/courses/:courseId', authenticateJwt ,(req, res) => {
  // logic to purchase a course

  let username = req.user.username
  let password = req.user.password
  let courseID = req.params.courseId
  console.log(username , password)

  fs.readFile('02-course-app-easy-2/users.json', 'utf8', (err, data) => {

    USERS = JSON.parse(data)

    index =-1 
    for(let i =0  ; i< USERS.length ; i++)
    {
      if(USERS[i].username === username && USERS[i].password ===password )
      {
        index = i
        break;
      }
    }

        USERS[index].purchasedCourses.push(courseID)

        fs.writeFile('02-course-app-easy-2/users.json' , JSON.stringify(USERS) , (err)=>{

          if(err)
          res.status(404).send('reading error')

          else
          res.json({ message: 'Course purchased successfully' });

        })



  })

});

app.get('/users/purchasedCourses',authenticateJwt, (req, res) => {
  // logic to view purchased courses
  
  username = req.user.username
  password = req.user.password
  console.log(username , password)

  fs.readFile('02-course-app-easy-2/users.json', 'utf8', (err, data) => {

    USERS = JSON.parse(data)

    let found = USERS.find(element => element.username === username && element.password === password)
    console.log(found)
    if (found)
    {
      res.send(found.purchasedCourses)
    }

    else
      res.status(404).send()

  })

});

app.listen(3000, () => {
  console.log('Server is listening on port 3000');
});
