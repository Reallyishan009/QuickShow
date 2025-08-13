import { Route, Routes, useLocation } from 'react-router-dom'
import Home from './pages/Home.jsx'
import Movies from './pages/Movies.jsx'
import MovieDetails from './pages/MovieDetails.jsx'
import TMDBMovieDetails from './pages/TMDBMovieDetails.jsx'
import SeatLayout from './pages/SeatLayout.jsx'
import MyBookings from './pages/MyBookings.jsx'
import Favorite from './pages/Favorite.jsx'
import Releases from './pages/Releases.jsx'
import Theaters from './pages/Theaters.jsx'
import Debug from './pages/Debug.jsx'
import { Toaster } from 'react-hot-toast'
import Footer from './components/Footer.jsx'
import Layout from './pages/admin/Layout.jsx'
import AddShows from './pages/admin/AddShows.jsx'
import ListShows from './pages/admin/ListShows.jsx'
import ListBookings from './pages/admin/ListBookings.jsx'
import { useAppContext } from './context/AppContext.jsx'
import { SignIn } from '@clerk/clerk-react'
import Loading from './components/Loading.jsx'
import Navbar from './components/NavBar.jsx'
import Dashboard from './pages/admin/DashBoard.jsx'

const App = () => {

  const isAdminRoute = useLocation().pathname.startsWith('/admin')

  const { user } = useAppContext()

  return (
    <>
      <Toaster />
      {!isAdminRoute && <Navbar/>}
      <Routes>
        <Route path='/' element={<Home/>} />
        <Route path='/movies' element={<Movies/>} />
        <Route path='/movies/:id' element={<MovieDetails/>} />
        <Route path='/tmdb-movie/:id' element={<TMDBMovieDetails/>} />
        <Route path='/movies/:id/:date' element={<SeatLayout/>} />
        <Route path='/my-bookings' element={<MyBookings/>} />
        <Route path='/loading/:nextUrl' element={<Loading/>} />
        <Route path='/releases' element={<Releases/>} />
        <Route path='/theaters' element={<Theaters/>} />
        <Route path='/favorite' element={<Favorite/>} />
        <Route path='/debug' element={<Debug/>} />
        <Route path='/admin/*' element={user ? <Layout/> : (
          <div className='min-h-screen flex justify-center items-center'>
            <SignIn afterSignInUrl={'/admin'} />
          </div>
        )}>
          <Route index element={<Dashboard/>}/>
          <Route path="add-shows" element={<AddShows/>}/>
          <Route path="list-shows" element={<ListShows/>}/>
          <Route path="list-bookings" element={<ListBookings/>}/>
        </Route>
      </Routes>
       {!isAdminRoute && <Footer />}
    </>
  )
}

export default App
