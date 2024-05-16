import React, { useState, useRef, useEffect } from "react";
import { io } from "socket.io-client";
const socket = io.connect("https://localhost:8181", {
  auth: {
    username: "Nova" + Math.floor(Math.random()*100),
    password: "pasww" + Math.floor(Math.random()*100),
  },
});



function DisplayPage() {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("pass");
  // console.log("hhhhhh");

  socket.on("connect", () => {
    console.log("connected from client side");
  });

  const [myFeed, setMyFeed] = useState(null);
  const [peerConnection, setPeerConnection] = useState(null);

  const myVideoRef = useRef(null);

  useEffect(() => {
    if (myVideoRef.current && myFeed) {
      myVideoRef.current.srcObject = myFeed;
    }
  }, [myFeed]);

  let peerConfig = {
    iceServers: [
      {
        urls: ["stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302"],
        // above both are provided stun servers which are free
      },
    ],
  };

  async function call(e) {
    // when i initiate a call
    e.preventDefault();
    if (myFeed) return;

    try {
      const stream = await fetchUserMedia();

      const connection = await createPeerConnection();

      // we need to add all the tracks that we will send to the other peer
      stream.getTracks().forEach((track) => {
        connection.addTrack(track, stream);
      });

      
      console.log("creating offer....");
      
      const offer = await connection.createOffer();
      console.log(offer);
      connection.setLocalDescription(offer); // here we have just created the first two req of initialising a connection b/w peers . now we need to send this to signalling server
      setPeerConnection(connection);
      
      // emit a new event sending offer to signalling server
      
      socket.emit("newOffer", offer);
    } catch (error) {
      console.log("user denied access to media devices");
    }
  }

  async function answerOffer(offerObj) {
    // console.log(offerObj);
    try {
      await fetchUserMedia();
      const connection = await createPeerConnection(offerObj);

      const answer = await connection.createAnswer();
      // console.log(connection.signalingState); // here it should be stable as no setDescription is called yet
      await connection.setLocalDescription(answer);
      // console.log(connection.signalingState); // here it should be have-local-pranswer as setLocalDescription is called
      setPeerConnection(connection)

      offerObj.answer = answer;
      // console.log(answer);
      // console.log(offerObj);
      // add the answer to offerObj so server could know which offer answer is related to 
      // answer is prepared so we emit it to signaling server and the server will emit it to other client.
      console.log("new ans called...")
      socket.emit('newAnswer',offerObj);

    } catch (error) {
      console.log(error);
    }
  }
  async function fetchUserMedia() {
    try {
      let stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });
      setMyFeed(stream);
      return stream;
    } catch (error) {
      console.log(error);
    }
  }

  const createPeerConnection = async (offerObj) => {
    let connection = await new RTCPeerConnection(peerConfig);

    // setPeerConnection(connection);

    connection.addEventListener('signalingstatechange',(e)=>{
      console.log(e);
      // console.log(connection.signalingState);
    })

    connection.addEventListener("icecandidate", (e) => {
      // console.log("--ice candidate found--");
      // console.log(e);
      if (e.candidate) {
        socket.emit("sendIceCandidateToSignalingSever", {
          iceCandidate: e.candidate,
          iceUsername: username,
          didIOffer: true,
        });
      }
    });
    if (offerObj) {
      //offerObj will be undefined in case user is calling (call())
      // offerObj will be defined for answering the offer (answerOffer())
      console.log(connection.signalingState); // here it should be stable as no setDescription is called yet
      await connection.setRemoteDescription(offerObj?.offer);
      console.log(connection.signalingState); // here it should be have-local-offer as setRemoteDescription is called
      setPeerConnection(connection)
    }
    return connection;
  };

  async function stopMyVid(e) {
    if (myFeed) {
      try {
        const tracks = myFeed.getTracks();
        tracks.forEach((track) => {
          track.stop();
        });

        setMyFeed(null);
      } catch (error) {
        console.log("Track error", error);
      }
    } else {
      console.log("No stream available to stop");
    }
  }

  function handleUsername(e) {
    setUsername((p) => e.target.value);
  }
  function handlePassword(e) {
    setPassword(e.target.value);
  }

  const [offerToAnswer, setOfferToAnswer] = useState([]);
  socket.on("availableOffers", (offers) => {
    createOfferEls(offers);
  });
  socket.on("newOfferAwaiting", (offers) => {
    createOfferEls(offers);
  });
  function createOfferEls(offers) {
    setOfferToAnswer((prev) => {
      return [...prev, ...offers];
    });
  }

  socket.on('answerResponse',async (offerToUpdate)=>{
    console.log(offerToUpdate);
     addAnswer(offerToUpdate)
  })

  async function addAnswer(offerToUpdate){
   try {
     //addAnswer is called when an answerResponse is emitted.
     //at this point, the offer and answer have been exchanged!
     // now we just need to set the remote
 
     console.log("jj",peerConnection.signalingState);
     await peerConnection.setRemoteDescription(offerToUpdate.answer)
     console.log(peerConnection.signalingState);
   } catch (error) {
    console.log(error);
   }
  }
  return (
    <div className=" p-2 bg-[#141214af] w-full min-h-screen flex flex-col ">
      <div>
        {offerToAnswer.map((ele, ind) => {
          return (
            <div key={ind} className="border-4">
              <div>Calling..</div>
              <button
                onClick={() => {
                  answerOffer(ele);
                }}
                className="bg-green-600 rounded-md"
              >
                Answer {ele.offererUserName}
              </button>
            </div>
          );
        })}
      </div>
      <div>
        Username: {username}
        <br />
        password: {password}
      </div>
      <div className="flex flex-row">
        <div>
          <video
            ref={myVideoRef}
            autoPlay
            style={{ transform: "scaleX(-1)" }}
          />
        </div>
      </div>
      <div className="flex flex-col m-2 p-2">
        <button className="m-2 p-2 bg-blue-500" onClick={(e) => stopMyVid(e)}>
          stop video
        </button>
      </div>

      <div>
        <button
          className={`bg-blue-500 m-2 p-2`}
          onClick={(e) => {
            call(e);
          }}
        >
          Call
        </button>
        <button
          className={`bg-blue-500 m-2 p-2`}
          onClick={(e) => {
            console.log("hang up");
          }}
        >
          hangUp
        </button>
        <button
          className={`bg-blue-500 m-2 p-2`}
          onClick={(e) => {
            console.log("answer");
          }}
        >
          answer
        </button>
      </div>
      <div>
        <label htmlFor="username">Username</label>
        <input
          name="username"
          type="text"
          onChange={handleUsername}
          value={username}
        />
      </div>
      <div>
        <label htmlFor="password">password</label>
        <input
          name="password"
          type="text"
          onChange={handlePassword}
          value={password}
        />
      </div>
    </div>
  );
}

export default DisplayPage;
