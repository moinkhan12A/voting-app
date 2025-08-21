const express = require('express');
const router = express.Router();
const User = require('./../models/user');
const Candidate = require('./../models/candidate');
const {jwtAuthMiddleware, generateToken} = require('./../jwt');


const checkAdminRole = async (userID) => {
   try{
    const user = await User.findById(userID)
    return user.role === 'admin';
   }catch(err){
    return false
   }
}

// POST route to add a candidate
router.post('/',jwtAuthMiddleware, async (req, res) =>{
    try{
        if(!await checkAdminRole(req.user.id)){
       return res.status(403).json({message:'user does not have admin role'})
        }
        const data = req.body // Assuming the request body contains the candidate data

        // Create a new candidate document using the Mongoose Model
        const newCandidate = new Candidate(data);

        // Save the new person to the database
        const response = await newCandidate.save();
        console.log('data saved');
        res.status(200).json({response: response});
    }
    catch(err){
        console.log(err);
        res.status(500).json({error: 'Internal Server Error'});
    }
})

router.put('/:candidateID',jwtAuthMiddleware, async (req, res)=>{
    try{
        if(!await checkAdminRole(req.user.id)){
       return res.status(403).json({message:'user does not have admin role'})
        }
        const candidateID = req.params.candidateID; // Extract the id from the URL parameter
        const updatedCandidateData = req.body; // Updated data for the person
        const response = await Candidate.findByIdAndUpdate(candidateID, updatedCandidateData, {
            new: true, // Return the updated document
            runValidators: true, // Run Mongoose validation
        })
        if (!response) {
            return res.status(403).json({ error: 'Candidate not found' });
        }
        console.log('Candidate data Updated');
        res.status(200).json(response)
    }catch(err){
        console.log(err);
        res.status(500).json({error: 'Internal Server Error'});
    }
})

router.delete('/:candidateID',jwtAuthMiddleware, async (req, res) => {
    try{
         if(!await checkAdminRole(req.user.id)){
       return res.status(403).json({message:'user does not have admin role'})
        }
        const candidateID = req.params.candidateID; // Extract the id from the URL parameter
        const response = await Candidate.findByIdAndDelete(candidateID)
        if (!response) {
            return res.status(404).json({ error: 'Candidate not found' });
        }
        console.log('Candidate deleted');
        res.status(200).json(response)
    }catch(err){
        console.log(err);
        res.status(500).json({error: 'Internal Server Error'});
    }
})

router.post('/vote/:candidateID',jwtAuthMiddleware,async(req,res)=>{
    const candidateID = req.params.candidateID
    const userID = req.user.id
    try{
        const candidate = await Candidate.findById(candidateID)
        if(!candidate){
            return res.status(404).json({message:'Candidate not found'})
        }
        const user = await User.findById(userID)
        if(!user){
          return res.status(404).json({message:'user not found'})  
        }
       if(user.isVoted){
        return res.status(400).json({message:'you have already Voted'})
       }
       if(user.role === 'admin'){
         return res.status(403).json({message:'Admin is not allowed to Vote'})
       }
      // update the candidate document to record the vote
      candidate.votes.push({user:userID})
      candidate.voteCount++
      await candidate.save()
      
      // update the user document 
      user.isVoted = true
     await user.save()

     res.status(200).json({message:"Vote Recorded Successfully"})
    }catch(err){
    console.log(err)
    res.status(500).json({error:'Internal Server Error'})
    }
})

// vote count
router.get('/vote/count',async (req,res)=>{
    try{
// find all candidates and sort them by votecount in descending order
   const candidate = await Candidate.find().sort({voteCount:'desc'})     

   // map the candidates to only return their name and votecount
   const voteRecord = candidate.map((data)=>{
    return {
        party:data.party,
        count:data.voteCount
    }
   })
   return res.status(200).json(voteRecord)
    }catch(err){
    console.log(err)
    res.status(500).json({error:'Internal Server Error'})
    }
})

// find all candidates
router.get('/',async(req,res)=>{
    try{
      const candidates = await Candidate.find()
      if(!candidates){
        return res.status(404).json({error:"candidates not found"})
      }
      res.status(200).json(candidates)
    }catch(err){
    res.status(500).json({error:'Internal Server Error'}) 
    }
})
module.exports = router;