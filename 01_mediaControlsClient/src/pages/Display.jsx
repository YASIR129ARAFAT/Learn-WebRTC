import React, { useState, useRef, useEffect } from "react";
import {
  playRecording,
  pauseRecording,
  startRecording,
  stopRecording,
} from "../handlers/mediaRecorder.handlers";
function Display() {
  const [myFeed, setMyFeed] = useState(null);
  const [clicked, setClicked] = useState(0);
  const [size, setSize] = useState({ height: 0, width: 0 });
  const videoRef = useRef(null);

  const [recordedBlob, setRecordedBlob] = useState([]);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const recordedVideoRef = useRef(null);

  const [screenShareStream, setScreenShareStream] = useState(null);

  const [allDevices, setAllDevices] = useState([]);
  useEffect(() => {
    if (videoRef.current && myFeed) {
      videoRef.current.srcObject = myFeed;
    }

    //for recording video
    if (recordedVideoRef.current) {
      recordedVideoRef.current.src = videoUrl;
    }
  }, [myFeed, videoUrl]);

  async function shareScreen() {
    try {
      const options = {
        audio: false,
        video: true,
        selfBrowserSurface: "exclude",
        surfaceSwitching: "exclude",
      };
      const stream = await navigator.mediaDevices.getDisplayMedia(options);
      setScreenShareStream(stream);
    } catch (error) {
      console.log(error);
    }
  }
  async function getAvlDevices() {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      console.log(devices);
      setAllDevices(devices);
    } catch (error) {
      console.log(error);
    }
  }
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

  async function handleChange(e) {
    try {
      const property = e.target.name;
      const value = e.target.value;
      setSize((prev) => {
        return { ...prev, [property]: value };
      });
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div className="m-20 w-full h-full flex flex-col bg-gray-300">
      <div className="flex flex-row">
        <div>
          <video ref={videoRef} autoPlay style={{ transform: "scaleX(-1)" }} />
        </div>
        {recordedVideoRef && (
          <div>
            <video ref={recordedVideoRef} controls={true} autoPlay />
          </div>
        )}
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
          <input
            name="height"
            id="height"
            type="number"
            value={size.height}
            onChange={(e) => {
              handleChange(e);
            }}
          />
        </div>
        <div className="flex flex-row mt-4 p-2">
          <label htmlFor="width">width</label>
          <input
            name="width"
            id="width"
            type="number"
            value={size.width}
            onChange={(e) => {
              handleChange(e);
            }}
          />
        </div>
      </div>
      <div className="mt-4 p-2 w-[60%] flex flex-row ">
        <button
          className="m-4 p-2 bg-green-500 rounded-lg"
          onClick={() => {
            startRecording(
              setMediaRecorder,
              setRecordedBlob,
              mediaRecorder,
              myFeed
            );
          }}
        >
          Start recording
        </button>
        <button
          className="m-4 p-2 bg-green-500 rounded-lg"
          onClick={() => {
            stopRecording(mediaRecorder);
          }}
        >
          Stop recording
        </button>
        <button
          className="m-4 p-2 bg-green-500 rounded-lg"
          onClick={() => {
            playRecording(recordedBlob, videoUrl, setVideoUrl);
          }}
        >
          play recording
        </button>
        <button
          className="m-4 p-2 bg-green-500 rounded-lg"
          onClick={() => {
            pauseRecording();
          }}
        >
          pause recording
        </button>
      </div>


      <div>
        <button
          className="m-4 p-2 bg-yellow-500 rounded-lg"
          onClick={() => {
            shareScreen();
          }}
        >
          Share Screen
        </button>
        <button
          className="m-4 p-2 bg-yellow-500 rounded-lg"
          onClick={() => {
            getAvlDevices();
          }}
        >
          get available devices
        </button>
      </div>

      <div>
        <div>
          <label for="audioInput">Choose audio input:</label>

          <select id="audioInput">
            {/* <option defaultValue={"select audio input"}>
              select audio input
            </option> */}
            {allDevices.map((ele, ind) => {
              const kind = ele?.kind;
              const label = ele?.label;
              const id = ele?.deviceId;
              return (
                kind === "audioinput" && (
                  <option key={ind} value={id}>
                    {label}
                  </option>
                )
              );
            })}
          </select>
        </div>

        <div>
          <label for="audioOutput">Choose audio input:</label>

          <select id="audioOutput">
            {/* <option defaultValue={"select audio Output"}>
              select audio Output
            </option> */}
            {allDevices.map((ele, ind) => {
              const kind = ele?.kind;
              const label = ele?.label;
              const id = ele?.deviceId;
              return (
                kind === "audiooutput" && (
                  <option key={ind} value={id}>
                    {label}
                  </option>
                )
              );
            })}
          </select>
        </div>

        <div>
          <label for="videoinput">Choose video input:</label>

          <select id="videoinput">
            {/* <option defaultValue={"select video input"}>
              select video input
            </option> */}
            {allDevices.map((ele, ind) => {
              const kind = ele?.kind;
              const label = ele?.label;
              const id = ele?.deviceId;
              return (
                kind === "videoinput" && (
                  <option key={ind} value={id}>
                    {label}
                  </option>
                )
              );
            })}
          </select>
        </div>


      </div>
    </div>
  );
}

export default Display;
