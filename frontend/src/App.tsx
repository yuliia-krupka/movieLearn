import SignIn from "./components/SignIn.tsx";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Account from "./components/account/Account.tsx";
import EnglishLevel from "./components/EnglishLevel.tsx";
import Interests from "./components/Interests.tsx";
import UpdateAccount from "./components/account/UpdateAccount.tsx";
import MoviesList from "./components/movie/MoviesList.tsx";
import NewMovieForm from "./components/movie/CreateMovie.tsx";
import Movie from "./components/movie/MovieDetails.tsx";
import Home from "./components/movie/Home.tsx";
import UpdateMovie from "./components/movie/UpdateMovie.tsx";
import { AuthProvider } from "./components/auth/AuthProvider.tsx";
import { ProtectedRoute } from "./components/auth/ProtectedRoute.tsx";
import UsersAdminPanel from "./components/UsersAdminPanel.tsx";
import FlashCardsModule from "./components/flash-card/FlashCardsModule.tsx";
import AdminDashboard from "./components/admin/AdminDashboard.tsx";
import AccessDenied from "./components/err/AccessDenied.tsx";

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/" element={<SignIn />} />

                    <Route
                        path="/level"
                        element={
                            <ProtectedRoute requireAuth={true}>
                                <EnglishLevel />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/interests"
                        element={
                            <ProtectedRoute requireAuth={true}>
                                <Interests />
                            </ProtectedRoute>
                        }
                    />

                    <Route path="/access-denied" element={<AccessDenied />} />

                    <Route
                        path="/account"
                        element={
                            <ProtectedRoute requireAuth={true}>
                                <Account />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/account/update"
                        element={
                            <ProtectedRoute requireAuth={true}>
                                <UpdateAccount />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/movies"
                        element={
                            <ProtectedRoute requireAuth={true}>
                                <MoviesList />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/home"
                        element={
                            <ProtectedRoute requireAuth={true}>
                                <Home />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/movies/:id"
                        element={
                            <ProtectedRoute requireAuth={true}>
                                <Movie />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/admin"
                        element={
                            <ProtectedRoute requireAdmin requireAuth={true}>
                                <AdminDashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/movies/new"
                        element={
                            <ProtectedRoute requireAdmin requireAuth={true}>
                                <NewMovieForm />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/movies/:id/update"
                        element={
                            <ProtectedRoute requireAdmin requireAuth={true}>
                                <UpdateMovie />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/users"
                        element={
                            <ProtectedRoute requireAdmin requireAuth={true}>
                                <UsersAdminPanel />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/flash-cards"
                        element={
                            <ProtectedRoute requireAuth={true}>
                                <FlashCardsModule />
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;