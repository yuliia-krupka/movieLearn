import SignIn from "./components/signIn/SignIn.tsx";
import {BrowserRouter as Router, Routes, Route} from "react-router-dom";
import Account from "./components/account/Account.tsx";
import EnglishLevel from "./components/englishLevel/EnglishLevel.tsx";
import Interests from "./components/interests/Interests.tsx";
import UpdateAccount from "./components/account/UpdateAccount.tsx";
import MoviesList from "./components/movie/MoviesList.tsx";
import NewMovieForm from "./components/movie/movie-form/NewMovieForm.tsx";
import Movie from "./components/movie/Movie.tsx";
import Home from "./components/movie/Home.tsx";
import UpdateMovieForm from "./components/movie/movie-form/UpdateMovieForm.tsx";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<SignIn/>}/>
                <Route path="/account" element={<Account/>}/>
                <Route path="/account/update" element={<UpdateAccount/>}/>
                <Route path="/level" element={<EnglishLevel/>}/>
                <Route path="/interests" element={<Interests/>}/>
                <Route path="/movies" element={<MoviesList/>}/>
                <Route path="/home" element={<Home/>}/>
                <Route path="/new-movie" element={<NewMovieForm/>}/>
                <Route path="/movies/:id" element={<Movie/>}/>
                <Route path="/movies/:id/update" element={<UpdateMovieForm/>}/>
            </Routes>
        </Router>
    );
}


export default App
