import Header from "../components/header";
import NumberGame from "../components/numberGame/numberGame";

function LockBox() {
  return (
    <>
        <Header label="Lockbox clue" />
        <div className="p-5">
            <NumberGame />
        </div>
    </>
  );
}

export default LockBox;