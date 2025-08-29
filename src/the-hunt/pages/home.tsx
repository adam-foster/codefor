import { Link } from 'react-router-dom';
import classnames from 'classnames';
import Banner from '../components/banner';
import { useEffect, useState } from 'react';
import { STORAGE_KEY as WORD_STORAGE_KEY } from '../components/wordGame/wordGame';
import { STORAGE_KEY as ANAGRAM_STORAGE_KEY } from '../components/anagramGame/anagramGame';
import { STORAGE_KEY as NUMBER_STORAGE_KEY } from '../components/numberGame/numberGame';
import { STORAGE_KEY as GEO_STORAGE_KEY } from '../components/geoGate/geoGate';

function Button({ children, href, isDisabled, isComplete }: { children: React.ReactNode; href: string; isDisabled: boolean; isComplete?: boolean; }) {
  const baseClasses = "w-full py-4 text-center text-sm font-medium text-gray-800 border rounded-xl shadow-sm transition"

  if(isDisabled) {
    return <div className={classnames(baseClasses, "bg-gray-200 border border-gray-300")}>
      {children}{` `}🔒
    </div>
  }
  return (
    <Link
      to={href}
      className={classnames(baseClasses, "bg-white border border-gray-200 hover:shadow-md hover:bg-gray-100 active:scale-[0.98]")}
    >
      {children}
      {` `}
      {isComplete ? "" : "→"}
    </Link>
  );
}

function Home() {
  const [isLocationFound1, setIsLocationFound1] = useState(false);
  const [isLocationFound2, setIsLocationFound2] = useState(false);
  const [isAtLocation, setIsAtLocation] = useState(false);
  const [isLockBoxOpen, setIsLockBoxOpen] = useState(false);

  // --- Hydrate from localStorage
  useEffect(() => {
    try {
      if (typeof window === "undefined") {
        return;
      }

      const wordRaw = localStorage.getItem(WORD_STORAGE_KEY);
      if (wordRaw) {
        const data = JSON.parse(wordRaw);
        setIsLocationFound1(data?.status === "won")
      }

      const anagramRaw = localStorage.getItem(ANAGRAM_STORAGE_KEY);
      if (anagramRaw) {
        const data = JSON.parse(anagramRaw);
        setIsLocationFound2(data?.status === "won")
      }

      const numberRaw = localStorage.getItem(NUMBER_STORAGE_KEY);
      if (numberRaw) {
        const data = JSON.parse(numberRaw);
        setIsLockBoxOpen(data?.status === "won")
      }

      const geoRaw = localStorage.getItem(GEO_STORAGE_KEY);
      if (geoRaw) {
        const data = JSON.parse(geoRaw);
        setIsAtLocation(data?.inside === true)
      }

    } catch {}
  }, []);

  const isLocationFound = isLocationFound1 && isLocationFound2;

  return (
    <>
        <Banner />
        <div className="flex flex-col items-center justify-center p-5">
            <h1 className="mb-5">Welcome to The Hunt 2025!</h1>
            <div className="w-full flex flex-col gap-4">
                <Button isComplete={isLocationFound} isDisabled={false} href="/location">
                  1. Location clue
                  {
                    isLocationFound && <strong className="ml-2 bg-green-600 text-white text-xs px-2 py-1 rounded-md">✔ DANCERS' ALLEY</strong>
                  }
                </Button>
                <Button isComplete={isLockBoxOpen} isDisabled={!isLocationFound && !isLockBoxOpen} href="/lock-box">
                  2. Lockbox
                  {
                    isLockBoxOpen && <strong className="ml-2 bg-green-600 text-white text-xs px-2 py-1 rounded-md">✔ 7662</strong>
                  }
                </Button>
                <Button isComplete={isAtLocation} href="/geo-gate" isDisabled={!isLockBoxOpen}>
                  3. Go to location 🏃‍♂️
                  {
                    isAtLocation && <strong className="ml-2 bg-green-600 text-white text-xs px-2 py-1 rounded-md">✔</strong>
                  }
                </Button>
                <Button isDisabled={!isAtLocation} href="/activity">4. Activity</Button>
            </div>
        </div>
    </>

  );
}

export default Home;