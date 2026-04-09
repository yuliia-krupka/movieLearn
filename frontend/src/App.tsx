import React, {Suspense} from "react";
import {BrowserRouter as Router, Routes, Route} from "react-router-dom";
import {Skeleton} from "antd";
import {AuthProvider} from "./components/auth/AuthProvider.tsx";
import {ProtectedRoute} from "./components/auth/ProtectedRoute.tsx";
import ErrorBoundary from "./components/err/ErrorBoundary.tsx";
import Home from "./components/movie/Home.tsx";

const SignIn = React.lazy(() => import("./components/auth/SignIn.tsx"));
const Account = React.lazy(() => import("./components/account/Account.tsx"));
const EnglishLevel = React.lazy(() => import("./components/onboarding/EnglishLevel.tsx"));
const Interests = React.lazy(() => import("./components/onboarding/Interests.tsx"));
const UpdateAccount = React.lazy(() => import("./components/account/UpdateAccount.tsx"));
const NewMovieForm = React.lazy(() => import("./components/movie/CreateMovie.tsx"));
const Movie = React.lazy(() => import("./components/movie/MovieDetails.tsx"));
const UpdateMovie = React.lazy(() => import("./components/movie/UpdateMovie.tsx"));
const UsersAdminPanel = React.lazy(() => import("./components/admin/UsersAdminPanel.tsx"));
const FlashCardsModule = React.lazy(() => import("./components/flash-card/FlashCardsModule.tsx"));
const TestsModule = React.lazy(() => import("./components/test/TestsModule.tsx"));
const AdminDashboard = React.lazy(() => import("./components/admin/AdminDashboard.tsx"));
const AccessDenied = React.lazy(() => import("./components/err/AccessDenied.tsx"));
const UpdateFlashCards = React.lazy(() => import("./components/flash-card/UpdateFlashCards.tsx"));
const AdminMoviesList = React.lazy(() => import("./components/movie/AdminMoviesList.tsx"));
const ProgressDashboard = React.lazy(() => import("./components/stats/ProgressDashboard.tsx"));
const About = React.lazy(() => import("./components/about/About.tsx"));
const NotFound = React.lazy(() => import("./components/err/NotFound.tsx"));

const SuspenseFallback = (
    <div style={{padding: '40px', maxWidth: '800px', margin: '0 auto'}}>
        <Skeleton active paragraph={{rows: 6}}/>
    </div>
);

function App() {
    return (
        <ErrorBoundary>
            <AuthProvider>
                <Router>
                    <Suspense fallback={SuspenseFallback}>
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
                                path="/movies/new"
                                element={
                                    <ProtectedRoute requireAuth={true} requireUser={true} requireOnboarding={true}>
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
                            <Route
                                path="/about"
                                element={
                                    <ProtectedRoute requireAuth={true}>
                                        <About/>
                                    </ProtectedRoute>
                                }
                            />
                            <Route path="*" element={<NotFound/>}/>
                        </Routes>
                    </Suspense>
                </Router>
            </AuthProvider>
        </ErrorBoundary>
    );
}

export default App;
