import { Route, Routes, useLocation } from 'react-router-dom'
import Home from '/src/pages/Home.jsx'
import Movies from '/src/pages/Movies.jsx'
import MovieDetails from '/src/pages/MovieDetails.jsx'
import SeatLayout from '/src/pages/SeatLayout.jsx'
import MyBookings from '/src/pages/MyBookings.jsx'
import Favorite from '/src/pages/Favorite.jsx'
import { Toaster } from 'react-hot-toast'
import Footer from '/src/components/Footer.jsx'
import Layout from '/src/pages/admin/Layout.jsx'
import AddShows from '/src/pages/admin/AddShows.jsx'
import ListShows from '/src/pages/admin/ListShows.jsx'
import ListBookings from '/src/pages/admin/ListBookings.jsx'
import { useAppContext } from '/src/context/AppContext.jsx'
import { SignIn } from '@clerk/clerk-react'
import Loading from '/src/components/Loading.jsx'
import Navbar from '/src/components/Navbar.jsx'
import Dashboard from '/src/pages/admin/Dashboard.jsx'

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
        <Route path='/movies/:id/:date' element={<SeatLayout/>} />
        <Route path='/my-bookings' element={<MyBookings/>} />
        <Route path='/loading/:nextUrl' element={<Loading/>} />

        <Route path='/favorite' element={<Favorite/>} />
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
