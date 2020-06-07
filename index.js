var express = require('express');
var app = express();
var logger = require('morgan');
var path = require('path');
var bodyParser = require('body-parser');
var session = require('express-session');
var flash = require('express-flash');

var frontendku = require('./routes/frontendku');
var adminku = require('./routes/adminku');

var conn = require('express-myconnection');
var mysql = require('mysql');

app.set('port', process.env.port || 3000);
app.set('view engine', 'ejs');

app.use(logger('dev'));
// app.use('/public', express.static(__dirname + '/public'));
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(flash());

app.use(
    conn(mysql, {
        host: '127.0.0.1',
        user: 'root',
        password: '',
        port: 3306,
        database: 'ecommerce'
    }, 'single')
);

app.use(
    session({
        secret: 'ibnusalam',
        resave: false,
        saveUninitialized: true,
        cookie: { maxAge: 120000 }
    })
);

app.get('/', function (req, res)
{
    res.send('Server is running on port ' + app.get('port'));
    // res.send('Server nya sudah running bosquh..!');
});

app.get('/ujian-exercises3modul6', frontendku.home);
// app.get('/ujian-exercises3modul6/product/', frontendku.product);
app.get('/ecommerce-modul6/products_detail/:id_product', frontendku.products_detail);
// app.get('/express/about', frontendku.about);
// app.get('/express/contact', frontendku.contact);
// app.get('/express/gallery', frontendku.gallery);
// app.get('/express/search-news', frontendku.search_news);

app.get('/express/admin', adminku.home);
app.get('/express/admin/login', adminku.login);
app.post('/express/admin/login', adminku.login);
app.get('/express/admin/home', adminku.home);
app.get('/express/admin/add_news', adminku.add_news);
app.post('/express/admin/add_news', adminku.process_add_news);
app.get('/express/admin/edit_news/:id_news', adminku.edit_news);
app.post('/express/admin/edit_news/:id_news', adminku.process_edit_news);
app.get('/express/admin/delete_news/:id_news', adminku.delete_news);
app.get('/express/admin/logout', adminku.logout);

app.listen(app.get('port'), function()
{
    console.log('Server is running on port ' + app.get('port'));
});