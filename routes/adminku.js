var multer = require('multer');

exports.login = function(req, res)
{
    var message = '';
    var sess = req.session;
    var md5 = require('md5');

    if (req.method == 'POST')
    { //jika route method-nya adalah POST, lakukan proses autentikasi login!
        var post = req.body;

        var name = post.username;
        var pass = md5(post.password);

        req.getConnection(function(err, connect)
        {
            var sql = "SELECT id_admin, username, name, admin_level FROM admin_tbl WHERE username='"+name+"' AND password='"+pass+"'";
            var query = connect.query(sql, function(err, results)
            {
                if (results.length)
                {
                    req.session.adminId = results[0].id_admin;
                    req.session.admin = results[0];
                    console.log(results[0].id_admin);
                    res.redirect('./home');
                }
                else
                {
                    message = 'Username or password incorrect! Please try again.';
                    res.render('./admin/index',
                    {
                        message: message
                    });
                }
            });
        })
    }
    else
    { //jika route method-nya adalah bukan POST, tampilkan form login!
        res.render('./admin/index', 
        {
            message: message
        });
    }
}

exports.home = function(req, res)
{
    var admin = req.session.admin;
    var adminId = req.session.adminId;
    console.log('id_admin=' + adminId);

    if (adminId == null)
    {
        res.redirect('/express/admin/login');
        return;
    }
    req.getConnection(function(err, connect)
    {
        var sql = "SELECT * FROM news_tbl ORDER BY createdate DESC";
        var query = connect.query(sql, function(err, results)
        {            
            res.render('./admin/home',
            {
                pathname: 'home',
                data: results
            });
        });

    });
}

exports.add_news = function(req, res)
{
    var admin = req.session.admin;
    var adminId = req.session.adminId;
    console.log('id_admin=' + adminId);

    if (adminId == null)
    {
        res.redirect('/express/admin/login');
        return;
    }
    res.render('./admin/home', 
    {
        pathname: 'add_news'
    });
}

exports.process_add_news = function(req, res)
{
    var storage = multer.diskStorage
    ({
        destination: './public/news_images',
        filename: function(req, file, callback)
        {
            callback(null, file.originalname);
        }
    });

    var upload = multer({ storage: storage}).single('image');
    var date = new Date(Date.now());

    upload(req, res, function(err) 
    {
        if (err)
        {
            return res.end('Error Uploading');
        }

        console.log(req.file);
        console.log(req.body);

        req.getConnection(function(err, connect)
        {
            var post = {
                title: req.body.title,
                description: req.body.description,
                images: req.file.filename,
                createdate: date
            }

            console.log(post);

            var sql = "INSERT INTO news_tbl SET ?";

            var query = connect.query(sql, post, function(err, results)
            {
                if (err)
                {
                    console.log('Error input news: %s', err);
                }

                req.flash('info', 'Success save data! Data has been saved.');
                res.redirect('/express/admin/home');
            });
        });
    });
}

exports.edit_news = function(req, res)
{
    var admin = req.session.admin;
    var adminId = req.session.adminId;
    console.log('id_admin=' + adminId);

    if (adminId == null)
    {
        res.redirect('/express/admin/login');
        return;
    }
    
    var id_news = req.params.id_news;

    req.getConnection(function(err, connect)
    {
        var sql = "SELECT * FROM news_tbl WHERE id_news=?";
        var query = connect.query(sql, id_news, function(err, results)
        {
            if (err)
            {
                console.log('Error show news: %s', err);
            }

            res.render('./admin/home', 
            {
                id_news: id_news,
                pathname: 'edit_news',
                data: results
            });
        });
    });
}

exports.process_edit_news = function(req, res)
{
    var id_news = req.params.id_news;

    var storage = multer.diskStorage
    ({
        destination: './public/news_images',
        filename: function(req, file, callback)
        {
            callback(null, file.originalname);
        }
    });

    var upload = multer({ storage: storage }).single('image');
    var date = new Date(Date.now());

    upload(req, res, function (err)
    {
        if (err)
        {
            var image = req.body.image_old;
            console.log("Error uploading image!");
        }
        else if (req.file == undefined)
        {
            var image = req.body.image_old; 
        }
        else
        {
            var image = req.file.filename;
        }

        console.log(req.file);
        console.log(req.body);

        req.getConnection(function (err, connect)
        {
            var post = {
                title: req.body.title,
                description: req.body.description,
                images: image,
                createdate: date
            }

            var sql = "UPDATE news_tbl SET ? WHERE id_news=?";

            var query = connect.query(sql, [post, id_news], function(err, results)
            {
                if (err)
                {
                    console.log("Error edit news: %s", err);
                }

                req.flash('info', 'Success edit data! Data has been updated.');
                res.redirect('/express/admin/home');
            });
        });
    });
}

exports.delete_news = function(req, res)
{
    var id_news = req.params.id_news;

    req.getConnection(function(err, connect)
    {
        var sql = "DELETE FROM news_tbl WHERE id_news=?";

        var query = connect.query(sql, id_news, function(err, results)
        {
            if (err)
            {
                console.log("Error delete news: %s", err);
            }

            req.flash('info', 'Success delete data! Data has been deleted.');
            res.redirect('/express/admin/home');
        })
    });
}

exports.logout = function(req, res)
{
    req.session.destroy(function(err)
    {
        res.redirect('/express/admin/login');
    });
}