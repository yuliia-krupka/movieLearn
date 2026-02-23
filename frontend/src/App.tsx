import SignIn from "./components/SignIn.tsx";
import {BrowserRouter as Router, Routes, Route} from "react-router-dom";
import Account from "./components/account/Account.tsx";
import EnglishLevel from "./components/EnglishLevel.tsx";
import Interests from "./components/Interests.tsx";
import UpdateAccount from "./components/account/UpdateAccount.tsx";
import MoviesList from "./components/movie/MoviesList.tsx";
import NewMovieForm from "./components/movie/CreateMovie.tsx";
import Movie from "./components/movie/MovieDetails.tsx";
import Home from "./components/movie/Home.tsx";
import UpdateMovie from "./components/movie/UpdateMovie.tsx";
import {AuthProvider} from "./components/auth/AuthProvider.tsx";
import {ProtectedRoute} from "./components/auth/ProtectedRoute.tsx";
import UsersAdminPanel from "./components/UsersAdminPanel.tsx";
import FlashCardsModule from "./components/flash-card/FlashCardsModule.tsx";
import TestsModule from "./components/test/TestsModule.tsx";
import AdminDashboard from "./components/admin/AdminDashboard.tsx";
import AccessDenied from "./components/err/AccessDenied.tsx";
import UpdateFlashCards from "./components/flash-card/UpdateFlashCards.tsx";
import AdminMoviesList from "./components/movie/AdminMoviesList.tsx";
import ProgressDashboard from "./components/stats/ProgressDashboard.tsx";

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/" element={<SignIn/>}/>

                    <Route
                        path="/level"
                        element={
                            <ProtectedRoute requireAuth={true} requireUser={true}>
                                <EnglishLevel/>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/interests"
                        element={
                            <ProtectedRoute requireAuth={true} requireUser={true}>
                                <Interests/>
                            </ProtectedRoute>
                        }
                    />

                    <Route path="/access-denied" element={<AccessDenied/>}/>

                    <Route
                        path="/account"
                        element={
                            <ProtectedRoute requireAuth={true} requireOnboarding={true}>
                                <Account/>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/account/update"
                        element={
                            <ProtectedRoute requireAuth={true}>
                                <UpdateAccount/>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/movies"
                        element={
                            <ProtectedRoute requireAuth={true} requireOnboarding={true}>
                                <MoviesList/>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/home"
                        element={
                            <ProtectedRoute requireAuth={true} requireUser={true} requireOnboarding={true}>
                                <Home/>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/movies/:id"
                        element={
                            <ProtectedRoute requireAuth={true} requireOnboarding={true}>
                                <Movie/>
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/admin"
                        element={
                            <ProtectedRoute requireAdmin requireAuth={true}>
                                <AdminDashboard/>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/movies"
                        element={
                            <ProtectedRoute requireAdmin requireAuth={true}>
                                <AdminMoviesList/>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/movies/new"
                        element={
                            <ProtectedRoute requireAdmin requireAuth={true}>
                                <NewMovieForm/>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/movies/:id/update"
                        element={
                            <ProtectedRoute requireAdmin requireAuth={true}>
                                <UpdateMovie/>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/users"
                        element={
                            <ProtectedRoute requireAdmin requireAuth={true}>
                                <UsersAdminPanel/>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/learning-sets/:id/update"
                        element={
                            <ProtectedRoute requireAuth={true} requireUser={true}>
                                <UpdateFlashCards/>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/learning-sets/:id/flashcards"
                        element={
                            <ProtectedRoute requireAuth={true} requireUser={true} requireOnboarding={true}>
                                <FlashCardsModule/>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/learning-sets/:id/tests"
                        element={
                            <ProtectedRoute requireAuth={true} requireUser={true} requireOnboarding={true}>
                                <TestsModule/>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/statistics"
                        element={
                            <ProtectedRoute requireAuth={true} requireUser={true} requireOnboarding={true}>
                                <ProgressDashboard/>
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;