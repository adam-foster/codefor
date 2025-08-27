import { Link } from 'react-router-dom';

function Header({ label, href = '/' } : { label: string; href?: string; }) {
  return (
    <header className="border-b p-5 flex justify-between items-center pr-15 bg-blue-100">
      <Link to={href}>← Back</Link>
      <div className="flex flex-1 justify-center">
        <h1 className='text-lg font-bold'>{label}</h1>
      </div>
    </header>
  );
}

export default Header;