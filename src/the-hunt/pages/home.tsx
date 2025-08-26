import { Link } from 'react-router-dom';
import Header from '../components/header';

function Button({ children, href }: { children: React.ReactNode; href: string }) {
  return (
    <Link
      to={href}
      className="w-full py-4 text-center text-sm font-medium text-gray-800 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md hover:bg-gray-100 active:scale-[0.98] transition"
    >
      {children}
    </Link>
  );
}

function Home() {
  return (
    <>
        <Header />
        <div className="flex flex-col items-center justify-center p-5">
            <h1 className="mb-5">Welcome to The Hunt 2025!</h1>
            <div className="w-full flex flex-col gap-4">
                <Button href="/location">1. Location clue →</Button>
                <Button href="/lock-box">2. Lockbox code clue →</Button>
                <Button href="/activity">3. Activity →</Button>
            </div>
        </div>
    </>

  );
}

export default Home;