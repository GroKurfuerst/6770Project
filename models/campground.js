const mongoose = require("mongoose")
const Schema = mongoose.Schema
const Review = require("./review")
const { cloudinary } = require("../cloudinary/index")
//const User = require("./user")

const ImageSchema = new Schema({
    url: String,
    filename: String
})

ImageSchema.virtual("thumbnail").get(function () {
    return this.url.replace("/upload", "/upload/w_200")
})

const CampgroundSchema = new Schema({
    title: String,
    images: [ImageSchema],
    geometry: {
        type: {
            type: String,
            enum: ["Point"],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    price: Number,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    reviews: [{
        type: Schema.Types.ObjectId,
        ref: "Review"
    }]
})

CampgroundSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        for (let image of doc.images) {
            await cloudinary.uploader.destroy(image.filename)
        }
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        })
    }
})

module.exports = mongoose.model("Campground", CampgroundSchema) //Return the database