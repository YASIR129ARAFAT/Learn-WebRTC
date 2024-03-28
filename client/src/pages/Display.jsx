import React, { useState, useRef, useEffect } from "react";

function Display() {
  const [myFeed, setMyFeed] = useState(null);
  const [clicked, setClicked] = useState(0);
  const [size, setSize] = useState({ height: 0, width: 0 });
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && myFeed) {
      videoRef.current.srcObject = myFeed;
    }
    // console.log(stream);
  }, [myFeed]);

  async function getMedia(e) {
    e.preventDefault();
    if (myFeed) return;

    try {
      let stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });
      setMyFeed(stream);
      setClicked((prev) => {
        return 1 - prev;
      });
    } catch (error) {
      console.log("user denied access to media devices");
    }
  }

  async function stopMyVid(e) {
    if (myFeed) {
      try {
        const tracks = myFeed.getTracks();
        tracks.forEach((track) => {
          track.stop();
        });
        setClicked((prev) => {
          return 1 - prev;
        });
        setMyFeed(null);
      } catch (error) {
        console.log("Track error", error);
      }
    } else {
      console.log("No stream available to stop");
    }
  }

  async function changeSize(e) {
    try {
      if (myFeed) {
        console.log("ddddd");
        myFeed.getVideoTracks().forEach((track) => {
          //track is a video track.
          //we can get it's capabilities from getCapabilities()
          //or we can apply new constraints with applyConstraints();

          /**
           * aspect ratio : width/height 
           * you cant give both width and height and aspect ratio only one should be
            given and other will be auto matically decided based on aspect ratio
           * if both are given then it will simply apply the one mention first in
             the constraints



           */
          const vidConstraints = {
            ...size, // width and height
            aspectRatio: 5, // width to height ratio
            frameRate: 60,
          };

          track.applyConstraints(vidConstraints);
        });
      }
    } catch (error) {
      console.log(error);
    }
  }

  async function handleChange(e){
    try {
        const property = e.target.name
        const value = e.target.value
        setSize((prev)=>{
            return {...prev,[property]:value}
        })
    } catch (error) {
        console.log(error);
    }
  }

  return (
    <div className="m-20 w-full h-full flex flex-col bg-gray-300">
      <div>
        <video ref={videoRef} autoPlay style={{ transform: "scaleX(-1)" }} />
      </div>
      <button
        className={`bg-blue-500 ${clicked === 1 ? "bg-red-500" : ""}`}
        onClick={(e) => getMedia(e)}
      >
        show video and audio
      </button>
      <button className="mt-2 bg-blue-500" onClick={(e) => stopMyVid(e)}>
        stop video
      </button>
      <button className="mt-2 bg-blue-500" onClick={(e) => changeSize(e)}>
        change video size
      </button>
      <div className="flex flex-col">
        <div className="flex flex-row mt-4 p-2">
          <label htmlFor="height">height</label>
          <input name="height" id="height" type="number" value={size.height} onChange={(e)=>{handleChange(e)}} />
        </div>
        <div className="flex flex-row mt-4 p-2">
          <label htmlFor="width">width</label>
          <input name="width" id="width" type="number" value={size.width} onChange={(e)=>{handleChange(e)}} />
        </div>
      </div>
    </div>
  );
}

export default Display;
