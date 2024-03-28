let mR;
const startRecording = async (
    setMediaRecorder,
    setRecordedBlob,
    mediaRecorder,
    myFeed
) => {
    if (!myFeed) {
        alert('stream is not available!!!');
        return;
    }

    mR = new MediaRecorder(myFeed);
    setMediaRecorder(mR)

    /**
     * the mediaRecorder will not be the value that is set-up above due to how the states changes are applied
     * so its better to use mR instead of mediaRecorder in below lines
     */
    mR.ondataavailable = (e) => {
        console.log("data is available...");
        setRecordedBlob((prev) => {
            return [...prev, e.data]
        })
    }
    mR.start();
    console.log("recording started...");
};

const stopRecording = (mediaRecorder) => {
    console.log("recording stopped...");

    /**
     * here the updated value of mediaRecorder (which is set inside start recording) will be available so we can    
       use it. No need to use mR here
     */
    mediaRecorder.stop()
};

const playRecording = (recordedBlob,videoUrl,setVideoUrl) => {
    console. log ("play recording")


    const superBuffer = new Blob (recordedBlob) // superBuffer is a super buffer of our
    
    // recordedVideoEl = document. querySelector ('#other-video');
    
    const URL = window.URL.createObjectURL(superBuffer)
    setVideoUrl(URL)
};

const pauseRecording = () => {
    console.log("recording paused...");
};

export { playRecording, pauseRecording, startRecording, stopRecording };