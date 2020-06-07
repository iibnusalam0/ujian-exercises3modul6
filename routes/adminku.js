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
                    res.render('./adminLTE/index',
                    {
                        message: message
                    });
                }
            });
        })
    }
    else
    { //jika route method-nya adalah bukan POST, tampilkan form login!
        res.render('./adminLTE/index', 
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
        res.redirect('/ujian-exercises3modul6/adminLTE/login');
        return;
    }
    req.getConnection(function(err, connect)
    {
        var sql = "SELECT * FROM product ORDER BY createdate DESC";
        var query = connect.query(sql, function(err, results)
        {            
            res.render('./adminLTE/home',
            {
                pathname: 'home',
                data: results
            });
        });

    });
}

exports.add_produk = function(req, res)
{
    var admin = req.session.admin;
    var adminId = req.session.adminId;
    console.log('id_admin=' + adminId);

    if (adminId == null)
    {
        res.redirect('/ujian-exercises3modul6/adminLTE/login');
        return;
    }
    res.render('./adminLTE/home', 
    {
        pathname: 'add_produk'
    });
}

exports.process_add_produk = function(req, res)
{
    var storage = multer.diskStorage
    ({
        destination: './public/adminLTE/produk_images',
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
                nama_produk: req.body.nm_produk,
                harga_product: req.body.harga_produk,
                des_product: req.body.des_produk,
                gambar_produk: req.file.filename,
                createdate: date
            } 

            console.log(post);

            var sql = "INSERT INTO product SET ?";

            var query = connect.query(sql, post, function(err, results)
            {
                if (err)
                {
                    console.log('Error input produk: %s', err);
                }

                req.flash('info', 'Success save data! Data has been saved.');
                res.redirect('/ujian-exercises3modul6/adminLTE/home');
            });
        });
    });
}

exports.edit_produk = function(req, res)
{
    var admin = req.session.admin;
    var adminId = req.session.adminId;
    console.log('id_admin=' + adminId);

    if (adminId == null)
    {
        res.redirect('/ujian-exercises3modul6/adminLTE/login');
        return;
    }
    
    var id_produk = req.params.id_produk;

    req.getConnection(function(err, connect)
    {
        var sql = "SELECT * FROM product WHERE id_product=?";
        var query = connect.query(sql, id_produk, function(err, results)
        {
            if (err)
            {
                console.log('Error show produk: %s', err);
            }

            res.render('./adminLTE/home', 
            {
                id_produk: id_produk,
                pathname: 'edit_produk',
                data: results
            });
        });
    });
}

exports.process_edit_produk = function(req, res)
{
    var id_produk = req.params.id_produk;

    var storage = multer.diskStorage
    ({
        destination: './public/adminLTE/produk_images',
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
                nama_produk: req.body.nm_produk,
                harga_product: req.body.harga_produk,
                des_product: req.body.des_produk,
                gambar_produk: image,
                createdate: date
            }

            var sql = "UPDATE product SET ? WHERE id_product=?";

            var query = connect.query(sql, [post, id_produk], function(err, results)
            {
                if (err)
                {
                    console.log("Error edit produk: %s", err);
                }

                req.flash('info', 'Success edit data! Data has been updated.');
                res.redirect('/ujian-exercises3modul6/adminLTE/home');
            });
        });
    });
}

exports.delete_produk = function(req, res)
{
    var id_produk = req.params.id_produk;

    req.getConnection(function(err, connect)
    {
        var sql = "DELETE FROM product WHERE id_product=?";

        var query = connect.query(sql, id_produk, function(err, results)
        {
            if (err)
            {
                console.log("Error delete produk: %s", err);
            }

            req.flash('info', 'Success delete data! Data has been deleted.');
            res.redirect('/ujian-exercises3modul6/adminLTE/home');
        })
    });
}

exports.logout = function(req, res)
{
    req.session.destroy(function(err)
    {
        res.redirect('/ujian-exercises3modul6/adminLTE/login');
    });
}