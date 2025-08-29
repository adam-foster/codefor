import Header from "../components/header";
import VideoPlayer from "../components/videoPlayer/videoPlayer";

function Activity() {

  return (
    <>
        <Header label="Activity" />
        <div className="p-5">
          <p>Look around, you guessed it... You are here to dance 💃 🕺</p>
          <br />
          <p>For this activity someone in your team will Moonwalk and someone else will Airwalk.</p>
          <br />

          <h2 className='font-bold underline'>Step 1</h2>
          <p>Watch the short tutorial videos (less than 30 secsonds)</p>
          <VideoPlayer label="Play Moonwalk tutorial" url="https://www.youtube.com/embed/fXQAAoFsWrA?autoplay=1&playsinline=1" />
          <VideoPlayer label="Play Airwalk tutorial" url="https://www.youtube.com/embed/H0qQfljdhCg?autoplay=1&playsinline=1" />
          
          <h2 className='font-bold underline'>Step 2</h2>
          <p>Practice and perfect your moves</p>
          <br />
          <h2 className='font-bold underline'>Step 3</h2>
          <p>Record two 5+ second video of the moonwalk (1pt) and the airwalk (1pt)</p>
          <br />
          <h2 className='font-bold underline'>Step 4</h2>
          <p>Share with everyone in the pub at end of the day 🍻 (1pt)</p>
          <br />
          <h2 className='font-bold underline'>Step 5</h2>
          <p>Optionally, share the videos on your socials (1pt)</p>
        </div>
    </>
  );
}

export default Activity;