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
app.post('/admin/signup', (req, res) => {
  // logic to sign up admin
  username = req.headers.username
  password = req.headers.password

  fs.readFile('admin.json', 'utf8', (err, data) => {

    ADMINS = JSON.parse(data)
    admin_id = Math.floor(Math.random() * 10000)

    ADMINS.push({ admin_id: admin_id, username: username, password: password })

    fs.writeFile('admin.json', JSON.stringify(ADMINS), (err) => {
      if (err)
        res.status(404).send()

      else
        res.send('Admin created successfully')
    })
  })


});

app.post('/admin/login', (req, res) => {
  // logic to log in admin
  username = req.headers.username
  password = req.headers.password

  fs.readFile('admin.json', 'utf8', (err, data) => {

    ADMINS = JSON.parse(data)

    let found = ADMINS.find(element => element.username === username && element.password === password)

    if (found)
      res.send('Logged in successfully')

    else
      res.status(404).send()

  })

});

app.post('/admin/courses', (req, res) => {
  // logic to create a course

  let username = req.headers.username
  let password = req.headers.password
  let title = req.body.title
  let description = req.body.description
  let price = req.body.price
  let imageLink = req.body.imageLink
  let published = req.body.published

  let courseID = Math.floor(Math.random() * 10000)

  fs.readFile('admin.json', 'utf8', (err, data) => {

    ADMINS = JSON.parse(data)

    let found = ADMINS.find(element => element.username === username && element.password === password)

    if (found) {
      fs.readFile('courses.json', 'utf8', (err, data) => {

        COURSES = JSON.parse(data)
        COURSES.push({
          admin_id: found.admin_id, courseID: courseID, title: title,
          description: description, price: price, imageLink: imageLink, published: published
        })

        fs.writeFile('courses.json', JSON.stringify(COURSES), (err) => {
          if (err)
            res.status(404).send()

          else
            res.send(`Course created successfully courseID : ${courseID}`)
        })
      })

    }

    else
      res.status(404).send()

  })




});


app.put('/admin/courses/:courseId', (req, res) => {
  // logic to edit a course

  let courseID = Number(req.params.courseId)
  console.log(courseID)
  let username = req.headers.username
  let password = req.headers.password

  fs.readFile('admin.json', 'utf8', (err, data) => {

    ADMINS = JSON.parse(data)

    let found = ADMINS.find(element => element.username === username && element.password === password)

    if (found) {
      fs.readFile('courses.json', 'utf8', (err, data) => {

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

          fs.writeFile('courses.json', JSON.stringify(COURSES), (err) => {

            if (err)
              res.status(404).send('writing error')

            else
              res.send('Course updated successfully')
          })
        }

        else
          res.status(404).send('course not found')

      })

    }

    else
      res.status(404).send('authentication error')

  })


});

app.get('/admin/courses', (req, res) => {
  // logic to get all courses

  fs.readFile('admin.json', 'utf8', (err, data) => {

    COURSES = JSON.parse(data)

    res.send(COURSES)
  })
});

// User routes
app.post('/users/signup', (req, res) => {
  // logic to sign up user

  let username = req.headers.username
  let password = req.headers.password


  fs.readFile('users.json', 'utf8', (err, data) => {

    USERS = JSON.parse(data)
    user_id = Math.floor(Math.random() * 10000)

    USERS.push({ user_id: user_id, username: username, password: password , purchasedCourses :[]})

    fs.writeFile('users.json', JSON.stringify(USERS), (err) => {
      if (err)
        res.status(404).send()

      else
        res.send('User created successfully')
    })
  })


});

app.post('/users/login', (req, res) => {
  // logic to log in user

  username = req.headers.username
  password = req.headers.password

  fs.readFile('users.json', 'utf8', (err, data) => {

    USERS = JSON.parse(data)

    let found = USERS.find(element => element.username === username && element.password === password)

    if (found)
      res.send('Logged in successfully')

    else
      res.status(404).send()

  })
});

app.get('/users/courses', (req, res) => {
  // logic to list all courses

  username = req.headers.username
  password = req.headers.password

  fs.readFile('users.json', 'utf8', (err, data) => {

    USERS = JSON.parse(data)

    let found = USERS.find(element => element.username === username && element.password === password)

    if (found)
      {
        fs.readFile('courses.json', 'utf8', (err, data) => {

          COURSES = JSON.parse(data)
      
          res.send({courses:COURSES})
        })
      }

    else
      res.status(404).send()

  })
});

app.post('/users/courses/:courseId', (req, res) => {
  // logic to purchase a course

  let username = req.headers.username
  let password = req.headers.password
  let courseID = req.params.courseId

  fs.readFile('users.json', 'utf8', (err, data) => {

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



    if (index!==-1)
      {
        USERS[index].purchasedCourses.push(courseID)

        fs.writeFile('users.json' , JSON.stringify(USERS) , (err)=>{

          if(err)
          res.status(404).send()

          else
          res.send('Course purchased successfully')
        })

      }

    else
      res.status(404).send('authentication failed')

  })
});

app.get('/users/purchasedCourses', (req, res) => {
  // logic to view purchased courses

  username = req.headers.username
  password = req.headers.password

  fs.readFile('users.json', 'utf8', (err, data) => {

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


