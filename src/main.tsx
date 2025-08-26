import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Home from './pages/home.tsx'
import TheHunt from './pages/the-hunt.tsx'
import NotFound from './pages/not-found.tsx'

const router = createBrowserRouter([
  {
    path: '/', element: <Home />
  },
  {
    path: '/the-hunt', element: <TheHunt />
  },
  {
    path: '*', element: <NotFound />
  }
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
