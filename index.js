// Requiring module
const express = require("express");
const multer = require("multer");
const port = 3000;
const app = express();
const cloudinary = require("cloudinary").v2;
const bodyParser = require("body-parser");
const fs = require("fs");
 
// Creating uploads folder if not already present
// In "uploads" folder we will temporarily upload
// image before uploading to cloudinary
if (!fs.existsSync("./uploads")) {
    fs.mkdirSync("./uploads");
}
 
// Multer setup
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./uploads");
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    },
});
 
var upload = multer({ storage: storage });
 
// Body parser configuration
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
 
app.use(express.static(__dirname + "/public"));
app.use("/uploads", express.static("uploads"));
 
// Cloudinary configuration
cloudinary.config({
    cloud_name: "XXXXXXXX",
    api_key: "XXXXXXX",
    api_secret: "XXXXXXXXXXX",
});
 
async function uploadToCloudinary(locaFilePath) {
 
    return cloudinary.uploader
        .upload(locaFilePath)
        .then((result) => {
 
            // Image has been successfully uploaded on
            // cloudinary So we dont need local image
            // file anymore
            // Remove file from local uploads folder
            fs.unlinkSync(locaFilePath);
 
            return {
                message: "Success",
                url: result.url,
            };
        })
        .catch((error) => {
 
            // Remove file from local uploads folder
            fs.unlinkSync(locaFilePath);
            return { message: "Fail" };
        });
}
 

 
app.post(
    "/profile-upload-single",
    upload.single("profile-file"),
    async (req, res, next) => {
 
        // req.file is the `profile-file` file
        // req.body will hold the text fields,
        // if there were any
 
        // req.file.path will have path of image
        // stored in uploads folder
        var locaFilePath = req.file.path;
        console.log("req.file.path",locaFilePath)
 
        // Upload the local image to Cloudinary
        // and get image url as response
        var result = await uploadToCloudinary(locaFilePath);
 
        // Generate html to display images on web page.
        //var response = buildSuccessMsg([result.url]);
        console.log("result.url",result)
 
        return res.send(result);
    }
);
 
app.post(
    "/profile-upload-multiple",
    upload.array("profile-files"),
    async (req, res, next) => {
 
        // req.files is array of `profile-files` files
        // req.body will contain the text fields,
        // if there were any
        var imageUrlList = [];
 
        for (var i = 0; i < req.files.length; i++) {
            var locaFilePath = req.files[i].path;
 
            // Upload the local image to Cloudinary
            // and get image url as response
            var result = await uploadToCloudinary(locaFilePath);
            imageUrlList.push(result.url);
        }
 
        // var response = buildSuccessMsg(imageUrlList);
 
        return  res.status(200).json({
            status: 'success',
            message: imageUrlList
        })
    }
);
 
app.listen(port, () => {
    console.log(`Server running on port ${port}!
            \nClick http://localhost:3000/`);
});
