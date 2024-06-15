const https = require('https');
const express = require('express');
const fs = require('fs');
const cors = require('cors')

const socketio = require('socket.io')
const app = express();
app.use(cors())

let key = fs.readFileSync('./certificates/key.pem');
let cert =  fs.readFileSync('./certificates/cert.pem');

const Server = https.createServer({ key, cert }, app);
const io = socketio(Server,{cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
}})



const port = 8181;

Server.listen(port, () => {
  console.log(`Server is at: https://localhost:${port}/`);
});


/*  the offer array is going to contain objects where each object will contain
                {
                    offererUsername
                    offer
                    offerIceCandidates
                    answererUsername
                    answer
                    answerIceCandidates
                }
*/
const offer = []
/**
 * the connectedSockets array will contain details of all the connected socket in form of object
 * username, socketId
 * this will keep track of all the connected sockets
 */
const connectedSockets = []

io.on('connection',(socket)=>{
    console.log("connection formed from server side...");
    const {username,password} = socket.handshake.auth 
    /**
     * What ever data is sent to io.connect(url,{data}) comes here in socket.handshake part
     */
    console.log(username,password);

    socket.on('newOffer',(newOffer)=>{
        // console.log(offer);
        offer.push({
            offererUserName: username,
            offer: newOffer, 
            offerIceCandidates: [], 
            answererUserName: null, 
            answer: null, 
            answererIceCandidates: []
        })
        connectedSockets.push({
            socketId: socket.id,
            username
        })

        socket.broadcast.emit('newOfferAwaiting',offer.slice(-1))

    })

    socket.on('sendIceCandidateToSignalingSever',iceCandidObj=>{
        const {didIOffer,iceCandidate,iceUsername} = iceCandidObj;
        // console.log(didIOffer,iceCandidate,iceUsername);

        if(didIOffer){
            offer.map((ele,ind)=>{
                // console.log(typeof ele.offererUserName);
                // console.log( ele.offererUserName);
                if(ele.offererUserName === iceUsername){

                    offer[ind].offerIceCandidates.push(iceCandidate);
                }
            });
           

        }
        // console.log(offer);
    })

    if(offer.length){
        socket.emit('availableOffers',offer)
    }

    socket.on('newAnswer',(offerObj)=>{
        // console.log("server side: \n",offerObj);
        // emit this answer that is inside offerObj
        // in order to do that we need the socket Id of the caller
        
        const socketToAnswer = connectedSockets.find((ele)=>ele.username===offerObj.offererUserName)

        if(!socketToAnswer){
            console.log("no matching socket to answer to");
            return;

        }
        const scoketIdToAnswer = socketToAnswer.socketId

        // find the corresponding offer in offer array
        const offerToUpdate = offer.find((ele)=>{
            return ele.offererUserName===offerObj.offererUserName
        })

        if(!offerToUpdate){
            console.log("no matching offer to update");
            return;
        }

        // now add the answer to offerToUpdate
        offerToUpdate.answer = offerObj.answer

        //update the answerer username
        offerToUpdate.answererUserName = username

        console.log("hiiii");
        console.log(offerObj);

        // now emit an event for response of answer to the scoketIdToAnswer
        socket.to(scoketIdToAnswer).emit("answerResponse",offerToUpdate)
        

    })
})
