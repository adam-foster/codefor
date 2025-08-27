import Header from "../components/header";
import AnagramGame from "../components/anagramGame/anagramGame";

function Location() {
  return (
    <>
        <Header href="/location" label="Location clue (2)" />
        <div className="p-5">
            <AnagramGame />
        </div>
    </>
  );
}

export default Location;