const express = require('express')
var bodyParser = require('body-parser')
var mysql = require('mysql');
var LocalStorage = require('node-localstorage').LocalStorage;
localStorage = new LocalStorage('./scratch');
const app = express()

var connection = mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'todolist'
});

connection.connect();
app.use(bodyParser.urlencoded({ extended: false }))
app.set('view engine', 'ejs');
app.use(express.static(__dirname))

app.get('/', function (req, res) {
      res.render('user_login')
})

app.post('/', function (req, res) {
      let email = req.body.email;
      let password = req.body.password;
      let query = "SELECT * FROM staff WHERE email='" + email + "' and password='" + password + "'";
      connection.query(query, function (error, result, index) {
            if (error) throw error;
            console.log(result);
            if (result.length == 1) {
                  localStorage.setItem('staff', JSON.stringify(result));
                  res.redirect('/userdashbord');
            } else {
                  res.redirect('/');
            }
      })
})
app.get('/userdashbord', function (req, res) {
      res.render('user_dashbord')
})

app.get('/admin', function (req, res) {
      res.render('admin_login')
})

app.post('/admin', function (req, res) {
      let email = req.body.email;
      let password = req.body.password;
      if (email == 'harsh@123' && password == '123') {
            res.render('admin_dashbord');
      }
      else {
            res.redirect('/admin')
      }
})

app.get('/admin/adduser', function (req, res) {
      res.render('adduser')
})

app.post('/admin/adduser', function (req, res) {
      let name = req.body.name;
      let email = req.body.email;
      let password = req.body.password;
      let query = "insert into staff(name,email,password) values('" + name + "','" + email + "','" + password + "')";
      connection.query(query, function (error, result, index) {
            if (error) throw error;
            res.render('adduser')
      })
})

app.get('/admin/showuser', function (req, res) {
      let query = "select * from staff";
      connection.query(query, function (error, result, index) {
            if (error) throw error;
            res.render('showuser', { result })
      })
})

app.get('/admin/showuser/delete/:id', function (req, res) {
      let id = req.params.id;
      let query = "DELETE FROM staff WHERE id=" + id;
      connection.query(query, function (error, result, index) {
            if (error) throw error;
            res.redirect('/admin/showuser')
      })
})

app.get('/admin/showuser/update/:id', function (req, res) {
      let id = req.params.id;
      let query = "SELECT * FROM staff WHERE id=" + id;
      connection.query(query, function (error, result, index) {
            if (error) throw error;
            res.render('updateuser', { result })
      })
})

app.post('/admin/showuser/update/:id', function (req, res) {
      let id = req.params.id;
      let name = req.body.name;
      let email = req.body.email;
      let password = req.body.password;
      let query = "UPDATE staff SET name='" + name + "',email='" + email + "',password='" + password + "' WHERE id=" + id;
      connection.query(query, function (error, result, index) {
            if (error) throw error;
            res.redirect('/admin/showuser')
      })
})

app.get('/admin/createtask', function (req, res) {
      let query = "SELECT * FROM staff";
      connection.query(query, function (error, result, index) {
            if (error) throw error;
            res.render('createtask', { result })
      })
})

app.post('/admin/createtask', function (req, res) {
      let name = req.body.name;
      let task = req.body.task;
      let edate = req.body.edate;
      let todate = new Date();
      let todat = todate.getDate();
      let tomon = todate.getMonth();
      tomon = Number(tomon);
      tomon++;
      if (tomon < 10) {
            tomon = String(tomon);
            tomon = "0" + tomon;
      } else {
            tomon = String(tomon);
      }
      let toyear = todate.getFullYear();
      let sdate = toyear + "-" + tomon + "-" + todat;
      let query = "insert into task(name,task,sdate,edate,status) values('" + name + "','" + task + "','" + sdate + "','" + edate + "','Pending')";
      connection.query(query, function (error, result, index) {
            if (error) throw error;
      })
      res.redirect('/admin/createtask')
})


app.get('/admin/showtask', function (req, res) {
      let query = "SELECT * FROM task";
      connection.query(query, function (error, result, index) {
            if (error) throw error;
            res.render('showtask', { result })
      })
})

app.get('/admin/managetask/:id', function (req, res) {
      let id = req.params.id;
      let user = [];
      let query = "SELECT name FROM staff";
      connection.query(query, function (error, result, index) {
            if (error) throw error;
            user = result;
      })
      query = "SELECT * FROM task where id=" + id;
      connection.query(query, function (error, result, index) {
            if (error) throw error;
            res.render('managetask', { result, user })
      })
})


app.post('/admin/managetask/:id', function (req, res) {
      let id = req.params.id;
      let name = req.body.name;
      let task = req.body.task;
      let sdate = req.body.sdate;
      let edate = req.body.edate;
      let status = req.body.status;
      let query = "UPDATE task SET name='" + name + "',task='" + task + "',sdate='" + sdate + "',edate='" + edate + "',status='" + status + "' where id=" + id;
      connection.query(query, function (error, result, index) {
            if (error) throw error;
            res.redirect('/admin/showtask');
      })
})

app.get('/assigntask', function (req, res) {
      let data = localStorage.getItem('staff');
      data = JSON.parse(data);
      let query = "SELECT * FROM task WHERE name = '" + data[0].name + "' and status = 'Pending'";
      connection.query(query, function (error, result, index) {
            if (error) throw error;
            res.render('assigntask', { result })
      })
})

app.get('/assigntask/manage', function (req, res) {
      let data = localStorage.getItem('staff');
      data = JSON.parse(data);
      let query = "SELECT * FROM task WHERE name = '" + data[0].name + "'";
      connection.query(query, function (error, result, index) {
            if (error) throw error;
            res.render('assigntaskmanage', { result })
      })
})

app.get('/assigntask/manage/:id', function (req, res) {
      let id = req.params.id;
      let data = localStorage.getItem('staff');
      data = JSON.parse(data);
      let query = "SELECT * FROM task WHERE name = '" + data[0].name + "'and id=" + id;
      connection.query(query, function (error, result, index) {
            if (error) throw error;
            res.render('updatestatus', { result })
      })
})

app.post('/assigntask/manage/:id', function (req, res) {
      let id = req.params.id;
      let status = req.body.status;
      console.log(status);
      let data = localStorage.getItem('staff');
      data = JSON.parse(data);
      let query = "UPDATE task set status='" + status + "' where id=" + id;
      connection.query(query, function (error, result, index) {
            if (error) throw error;
            res.redirect('/assigntask/manage')
      })
})

app.get('/assigntask/accept/:id', function (req, res) {
      let id = req.params.id;
      let query = "UPDATE task set status='Accept' where id=" + id;
      connection.query(query, function (error, result, index) {
            if (error) throw error;
            res.redirect('/assigntask')
      })
})

app.get('/assigntask/decline/:id', function (req, res) {
      let id = req.params.id;
      let query = "UPDATE task set status='Decline' where id=" + id;
      connection.query(query, function (error, result, index) {
            if (error) throw error;
            res.redirect('/assigntask')
      })
})

app.get('/task/:status', function (req, res) {
      let status = req.params.status;
      console.log(status);
      let data = localStorage.getItem('staff');
      data = JSON.parse(data);
      let query = "SELECT * FROM task WHERE name = '" + data[0].name + "' and status = '" + status + "'";
      // let query = "UPDATE task set status='Decline' where id=" + id;
      connection.query(query, function (error, result, index) {
            if (error) throw error;
            console.log(result);
            res.render('status', { result })
      })
})

app.get('/assigntask/logout', function (req, res) {
      localStorage.removeItem('staff');
      res.redirect('/');
})

app.listen(3000)