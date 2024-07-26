const fs = require("fs");
const path = require("path");
const dataPath = path.join(__dirname, '../data/students.json');

class Data {
    constructor(students, courses) {
        this.students = students;
        this.courses = courses;
    }
}

let dataCollection = null;

module.exports.initialize = function () {
    return new Promise((resolve, reject) => {
        fs.readFile('./data/courses.json', 'utf8', (err, courseData) => {
            if (err) {
                reject("unable to load courses"); return;
            }

            fs.readFile('./data/students.json', 'utf8', (err, studentData) => {
                if (err) {
                    reject("unable to load students"); return;
                }

                dataCollection = new Data(JSON.parse(studentData), JSON.parse(courseData));
                resolve();
            });
        });
    });
}

module.exports.getAllStudents = function () {
    return new Promise((resolve, reject) => {
        if (dataCollection.students.length == 0) {
            reject("query returned 0 results"); return;
        }

        resolve(dataCollection.students);
    })
}

module.exports.getCourses = function () {
    return new Promise((resolve, reject) => {
        if (dataCollection.courses.length == 0) {
            reject("query returned 0 results"); return;
        }

        resolve(dataCollection.courses);
    });
};

module.exports.getStudentByNum = function (num) {
    return new Promise(function (resolve, reject) {
        var foundStudent = null;

        for (let i = 0; i < dataCollection.students.length; i++) {
            if (dataCollection.students[i].studentNum == num) {
                foundStudent = dataCollection.students[i];
            }
        }

        if (!foundStudent) {
            reject("query returned 0 results"); return;
        }

        resolve(foundStudent);
    });
};

module.exports.getStudentsByCourse = function (course) {
    return new Promise(function (resolve, reject) {
        var filteredStudents = [];

        for (let i = 0; i < dataCollection.students.length; i++) {
            if (dataCollection.students[i].course == course) {
                filteredStudents.push(dataCollection.students[i]);
            }
        }

        if (filteredStudents.length == 0) {
            reject("query returned 0 results"); return;
        }

        resolve(filteredStudents);
    });
};

module.exports.addStudent = function (studentData) {
    return new Promise(function (resolve, reject) {
        studentData.TA = studentData.TA === undefined ? false : true;
        studentData.studentNum = dataCollection.students.length + 1;
        dataCollection.students.push(studentData);
        resolve(studentData);
    });
};

module.exports.getCourseById = function (id) {
    return new Promise((resolve, reject) => {
        const courseIdNumber = Number(id);
        const course = dataCollection.courses.find(c => c.courseId === courseIdNumber);
        if (course) {
            resolve(course);
        } else {
            reject("query returned 0 results");
        }
    });
}

module.exports.updateStudent = function (studentData) {
    return new Promise((resolve, reject) => {
        const studentIndex = dataCollection.students.findIndex(student => student.studentNum == studentData.studentNum);
        if (studentIndex !== -1) {
            dataCollection.students[studentIndex] = {
                ...dataCollection.students[studentIndex],
                firstName: studentData.firstName,
                lastName: studentData.lastName,
                email: studentData.email,
                addressStreet: studentData.addressStreet,
                addressCity: studentData.addressCity,
                addressProvince: studentData.addressProvince,
                TA: studentData.TA === 'on',
                status: studentData.status,
                course: studentData.course
            };
            fs.writeFile(dataPath, JSON.stringify(dataCollection.students, null, 2), (err) => {
                if (err) {
                    reject("Unable to save student data");
                } else {
                    resolve();
                }
            });
        } else {
            reject("Student not found");
        }
        resolve();
    });
};