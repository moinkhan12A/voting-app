const mongoose =  require('mongoose');
//const bcrypt = require('bcrypt');

// Define the Person schema
const candidateSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    party:{
     type:String
    },
    age:{
    type:Number
    },
    votes:[
        {
            user:{
                type:mongoose.Schema.Types.ObjectId,
                ref:'User',
                required:true
            },
            votedAt:{
                type:Date,
                default:Date.now()
            }
        }
    ],
    voteCount:{
        type:Number,
        default:0
    }
});

// Create Person model
const Candidate = mongoose.model('Candidate', candidateSchema);
module.exports = Candidate;