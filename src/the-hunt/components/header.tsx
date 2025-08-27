import { Link } from 'react-router-dom';

function Header({ label, href = '/' } : { label: string; href?: string; }) {
  return (
    <footer className="border-b p-5 flex justify-between items-center pr-15">
      <Link to={href}>← Back</Link>
      <div className="flex flex-1 justify-center">
        <h1 className='text-lg font-bold'>{label}</h1>
      </div>
    </footer>
  );
}

export default Header;