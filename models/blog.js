const mongoose = require('mongoose');

const blogSchema = mongoose.Schema({
    Blog_image : {
        type : String,
    },
    Blog_title : {
        type:String,
        required : true,
    },
    Blog_description :{type: String},
    Cloud_id : {type: String}
})

exports.Blog = mongoose.model('Blog',blogSchema);