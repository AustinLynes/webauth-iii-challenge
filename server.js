const express = require('express')
const server = express()
const cors = require('cors')
const morgan = require('morgan')
const helmet = require('helmet')
const Users = require('./helpers/user-model')

server.use(cors())
server.use(express.json())
server.use(morgan('combined'))
server.use(helmet())

const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

server.post('/api/login', (req, res) => {
    const creds = req.body
    Users.find(creds.username)
    .then((_user)=>{
        if(_user && bcrypt.compareSync(creds.password,_user.password)){
            //log in 
            const token = createToken(_user)
            res.status(200).json({messege:'Log in Successful...', token})

        }else{
            // fail
            res.status(404).json({messege:'sorry wrong creds...'})
        }
    }).catch((_err)=>{
        res.status(500).json(_err)
    })
})
const secret = 'shhhh... its a secret'
function createToken(_user){
    const payload ={
        username:_user.username,
        department:_user.department
    }
  
    const options = {
        expiresIn:'8h'
    }
    return jwt.sign(payload,secret,options)
}
/*
{
	"username":"Donkey Kong",
	"password":"BiggestBannanas",
	"department":"unpaid-user"
}
{
	"username":"Diddy_Kong",
	"password":"SmallestBannanas",
	"department":"unpaid-user"
}
*/
server.post('/api/register', (req, res) => {
    const user = req.body
    const hash = bcrypt.hashSync(user.password, 16)
    user.password = hash
    Users.register(user).then((_user) => {
        if (!_user) {
            res.status(400).json({ messege: 'something went wrong with creating your account boss...' })
        } else {
            res.status(201).json({ messege: 'register successful boss!' })
        }
    }).catch((_err) => {
        res.status(500).json(_err)
    })
})

server.get('/api/users', auth, (req, res) => {
    Users.find().then((_user) => {
        res.json(_user)
    }).catch((_err) => {
        res.status(500).json(_err)
    })
})

function auth(req, res, next) {
    const token = req.headers.authorization
    if(token){
        jwt.verify(token,secret, (err, decodedToken)=>{
            if(err){
                res.status(401).json({messege:'token has been altered... going to self destruct.... '})
            }else{
                req.decodedToken = decodedToken
                next()
            }
        })
    } else{
        res.status(401).json({alert:'Cannot See that... sorry buddy'})

    }
}

module.exports = server