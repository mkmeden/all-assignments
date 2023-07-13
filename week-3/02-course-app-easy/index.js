const express = require('express');
const app = express();
const fs = require('fs')
const bodyParser = require('body-parser');
const { title } = require('process');
app.use(express.json());


let ADMINS = [];
let USERS = [];
let COURSES = [];

// Admin routes

const adminauthentication = (req, res ,next)=>{

  username = req.headers.username
  password = req.headers.password

  fs.readFile('week-3/02-course-app-easy/admin.json' , 'utf8' , (err , data)=>{

    ADMINS = JSON.parse(data)
console.log(ADMINS)
    check = ADMINS.find((x) => x.username === username && x.password === password)

    if(check)
    {
      next()
    }

    else
    {
      res.status(403).json({ message: 'Admin authentication failed' });
    }

  })
}

const userauthentication = (req, res ,next)=>{

  username = req.headers.username
  password = req.headers.password

  fs.readFile('week-3/02-course-app-easy/users.json' , 'utf8' , (err , data)=>{

    USERS = JSON.parse(data)

    check = USERS.find((x) => x.username === username && x.password === password)

    if(check)
    {
      next()
    }

    else
    {
      res.status(403).json({ message: 'User authentication failed' });
    }

  })
}


app.post('/admin/signup', (req, res) => {
  // logic to sign up admin
  username = req.headers.username
  password = req.headers.password

  console.log(username , password)

  fs.readFile('week-3/02-course-app-easy/admin.json', 'utf8', (err, data) => {

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

      fs.writeFile('week-3/02-course-app-easy/admin.json', JSON.stringify(ADMINS), (err) => {
        if (err)
          res.status(404).send()
  
        else
        res.json({ message: 'Admin created successfully' });

      })
    }

  })


});

app.post('/admin/login', adminauthentication ,(req, res) => {
  // logic to log in admin
  
  res.json({ message: 'Logged in successfully' });


});

app.post('/admin/courses',adminauthentication ,(req, res) => {
  // logic to create a course

  let title = req.body.title
  let description = req.body.description
  let price = req.body.price
  let imageLink = req.body.imageLink
  let published = req.body.published

  let courseID = Math.floor(Math.random() * 10000)

fs.readFile('week-3/02-course-app-easy/admin.json', 'utf8' , (err , data) => {

  ADMINS = JSON.parse(data)
  found = ADMINS.find((x)=>x.username === req.headers.username && x.password === req.headers.password)



  fs.readFile('week-3/02-course-app-easy/courses.json', 'utf8', (err, data) => {

    COURSES = JSON.parse(data)
    COURSES.push({
      admin_id: found.admin_id, courseID: courseID, title: title,
      description: description, price: price, imageLink: imageLink, published: published
    })

    fs.writeFile('week-3/02-course-app-easy/courses.json', JSON.stringify(COURSES), (err) => {
      if (err)
        res.status(404).send()

      else
      res.json({ message: 'Course created successfully', courseId: courseID });

    })
  })

})
     

  })



app.put('/admin/courses/:courseId',adminauthentication ,(req, res) => {
  // logic to edit a course

  let courseID = Number(req.params.courseId)
  console.log(courseID)

      fs.readFile('week-3/02-course-app-easy/courses.json', 'utf8', (err, data) => {

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

          fs.writeFile('week-3/02-course-app-easy/courses.json', JSON.stringify(COURSES), (err) => {

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

app.get('/admin/courses', adminauthentication,(req, res) => {
  // logic to get all courses

  fs.readFile('week-3/02-course-app-easy/admin.json', 'utf8', (err, data) => {

    COURSES = JSON.parse(data)

    res.json({ courses: COURSES });

  })
});

// User routes
app.post('/users/signup', (req, res) => {
  // logic to sign up user

  let username = req.headers.username
  let password = req.headers.password


  fs.readFile('week-3/02-course-app-easy/users.json', 'utf8', (err, data) => {

    USERS = JSON.parse(data)
    user_id = Math.floor(Math.random() * 10000)

    check = USERS.find((x)=> x.username ===username && x.password===password)

    if(check)
    res.status(403).json({ message: 'User already exists' });

    else
    {
      USERS.push({ user_id: user_id, username: username, password: password , purchasedCourses :[]})

      fs.writeFile('week-3/02-course-app-easy/users.json', JSON.stringify(USERS), (err) => {
        if (err)
          res.status(404).send()
  
        else
        res.json({ message: 'User created successfully' });
  
      })

    }


  })


});

app.post('/users/login', userauthentication,(req, res) => {
  // logic to log in user
  res.json({ message: 'Logged in successfully' });

});

app.get('/users/courses', userauthentication,(req, res) => {
  // logic to list all courses

  fs.readFile('week-3/02-course-app-easy/users.json', 'utf8', (err, data) => {

    USERS = JSON.parse(data)

        fs.readFile('week-3/02-course-app-easy/courses.json', 'utf8', (err, data) => {

          COURSES = JSON.parse(data)
      
          res.send({courses:COURSES})
        })
  })
});

app.post('/users/courses/:courseId', userauthentication,(req, res) => {
  // logic to purchase a course

  let username = req.headers.username
  let password = req.headers.password
  let courseID = req.params.courseId

  fs.readFile('week-3/02-course-app-easy/users.json', 'utf8', (err, data) => {

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

        fs.writeFile('week-3/02-course-app-easy/users.json' , JSON.stringify(USERS) , (err)=>{

          if(err)
          res.status(404).send('reading error')

          else
          res.json({ message: 'Course purchased successfully' });

        })



  })
});

app.get('/users/purchasedCourses', userauthentication,(req, res) => {
  // logic to view purchased courses

  username = req.headers.username
  password = req.headers.password

  fs.readFile('week-3/02-course-app-easy/users.json', 'utf8', (err, data) => {

    USERS = JSON.parse(data)

    let found = USERS.find(element => element.username === username && element.password === password)

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


