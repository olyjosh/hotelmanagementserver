/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var uuid = require('node-uuid'),
multiparty = require('multiparty'),
fs = require('fs');

path = require('path');
global.appRoot = path.resolve(__dirname);

exports.postImage = function (req, res) {
    var form = new multiparty.Form();
    form.parse(req, function (err, fields, files) {
        var file = files.file[0];
        var contentType = file.headers['content-type'];
        var tmpPath = file.path;
        var extIndex = tmpPath.lastIndexOf('.');
        var extension = (extIndex < 0) ? '' : tmpPath.substr(extIndex);
        // uuid is for generating unique filenames.
        var fileName = uuid.v4() + extension;
        var destPath = appRoot + '/res/images/upload/';

        // Server side file type checker.
        if (contentType !== 'image/png' && contentType !== 'image/jpeg') {
            fs.unlink(tmpPath);
            return res.status(400).send('Unsupported file type.');
        }

        if (!fs.existsSync(destPath)) {
            fs.mkdirSync(destPath);
        }
        var destPath = destPath+fileName;
        var is = fs.createReadStream(tmpPath);
        var os = fs.createWriteStream(destPath);

        if (is.pipe(os)) {
            fs.unlink(tmpPath, function (err) { //To unlink the file from temp path after copy
                if (err) {
                    console.log(err);
                }
            });
            
            return res.json({status:1, fileId:fileName});
        } else
            return res.json({status:0});
    });
};