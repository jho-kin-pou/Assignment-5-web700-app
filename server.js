/*********************************************************************************
*  WEB700 – Assignment 05
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part 
*  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Jeffery Ho Kin Pou
*  Student ID: jho-kin-pou (151600236)
*  Date: 26 July 2024
*
*  Online (vercel) Link: https://assignment-5-web700-app.vercel.app/
*
********************************************************************************/


var HTTP_PORT = process.env.PORT || 8080;
var express = require("express");
var app = express();

const path = require('path');
const collegeData = require('./modules/collegeData');
const exphbs = require('express-handlebars');

app.engine('.hbs', exphbs.engine({
    extname: '.hbs', defaultLayout: 'main',
    helpers: {
        navLink: function (url, options) {
            return '<li' +
                ((url == app.locals.activeRoute) ? ' class="nav-item active" ' : ' class="nav-item" ') +
                '><a class="nav-link" href="' + url + '">' + options.fn(this) + '</a></li>';
        },
        equal: function (lvalue, rvalue, options) {
            if (arguments.length < 3)
                throw new Error("Handlebars Helper equal needs 2 parameters");
            if (lvalue != rvalue) {
                return options.inverse(this);
            } else {
                return options.fn(this);
            }
        }
    }
}));

app.set('view engine', 'hbs');

app.use(express.urlencoded({ extended: true }));

app.use(express.static('public'));

app.use(function (req, res, next) {
    let route = req.path.substring(1);
    app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
    next();
});

app.get('/students/add', (req, res) => {
    res.render('addStudent');
});

app.post('/students/add', (req, res) => {
    collegeData.addStudent(req.body)
        .then(() => {
            res.redirect('/students');
        })
        .catch(error => {
            console.error('Error adding student: ', error);
            res.status(500).send('Error adding student');
        });
});

app.post("/student/update", (req, res) => {
    collegeData.updateStudent(req.body)
        .then(() => { res.redirect("/students") })
        .catch(err => {
            res.status(500).send("Unable to update student");
        });
});

app.get('/students', (req, res) => {
    const course = req.query.course;
    if (course) {
        collegeData.getStudentsByCourse(course).then((data) => {
            res.render('students', { students: data });
        }).catch((err) => {
            res.render('students', { message: "no sresults" });
        });
    } else {
        collegeData.getAllStudents().then((data) => {
            res.render('students', { students: data });
        }).catch((err) => {
            res.render('students', { message: "no results" });
        });
    }
});

app.get('/courses', (req, res) => {
    collegeData.getCourses().then((data) => {
        res.render('courses', { courses: data });
    }).catch((err) => {
        res.render('courses', { message: "no results" });
    });
});

app.get("/student/:studentNum", (req, res) => {
    const studentNum = req.params.studentNum;
    Promise.all([
        collegeData.getStudentByNum(studentNum),
        collegeData.getCourses()
    ])
    .then(([student, courses]) => {
        res.render("student", { student, courses });
    })
    .catch(err => {
        console.error(err);
        res.status(500).send("Unable to retrieve student data");
    });
});

app.get('/course/:id', (req, res) => {
    const courseId = Number(req.params.id);
    collegeData.getCourseById(courseId).then((data) => {
        res.render('course', { course: data });
    }).catch((err) => {
        res.status(404).send("Course not found");
    });
});

app.get('/', (req, res) => {
    res.render('home');
});

app.get('/about', (req, res) => {
    res.render('about');
});

app.get('/htmlDemo', (req, res) => {
    res.render('htmlDemo');
});

app.use((req, res) => {
    res.status(404).send("Page Not Found");
});

collegeData.initialize().then(() => {
    app.listen(HTTP_PORT, () => {
        console.log("server listening on port: " + HTTP_PORT);
    });
}).catch((err) => {
    console.log(`Failed to initialize data: ${err}`);
});