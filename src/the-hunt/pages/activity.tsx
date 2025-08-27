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
          <p>Record a 5+ second video of both the moonwalk and airwalk</p>
          <br />
          <h2 className='font-bold underline'>Step 4</h2>
          <p>Share with everyone at the end of the day 🍻</p>
          <br />
          <h2 className='font-bold underline'>Step 5</h2>
          <p>For a bonus point, share the videos on your socials</p>

        </div>
    </>
  );
}

export default Activity;