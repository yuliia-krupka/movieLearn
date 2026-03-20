import React from 'react';
import {LinkOutlined} from '@ant-design/icons';
import MainLayout from '../layout/MainLayout';
import './About.css';
import Logo from "../shared/Logo.tsx";

const TMDB_LOGO_URL =
    'https://www.themoviedb.org/assets/2/v4/logos/v2/blue_long_2-9665a76b1ae401a510ec1e0ca40ddcb3b0cfe45f1d51b77a308fea0845885648.svg';

const About: React.FC = () => {
    return (
        <MainLayout>
            <div className="about-page">
                <div className="about-header">
                    <Logo level={1}/>
                    <p>Learn English from the scripts of your favorite movies!</p>
                </div>

                <div className="about-section">
                    <h2>About the Project</h2>
                    <p>
                        MovieLearn is a non-commercial, educational application designed to help users improve their
                        English language skills by studying vocabulary from movie scripts. Users can generate
                        personalized flash cards and tests based on movie dialogues.
                    </p>
                    <p>
                        The application currently uses manually created scripts of movies that are in the public domain
                        in both the
                        United States and Ukraine (for educational purposes only).
                    </p>
                </div>

                <div className="about-section tmdb-section">
                    <h2>Data Attribution</h2>
                    <img
                        src={TMDB_LOGO_URL}
                        alt="The Movie Database (TMDB)"
                        className="tmdb-logo"
                    />
                    <div className="tmdb-text">
                        <p>
                            This application uses the{' '}
                            <a href="https://www.themoviedb.org/" target="_blank" rel="noopener noreferrer"
                               className="tmdb-link">
                                TMDB API <LinkOutlined/>
                            </a>{' '}
                            to retrieve movie metadata and poster images.
                        </p>
                        <p className="tmdb-disclaimer">
                            This product uses the TMDB API but is not endorsed or certified by TMDB.
                        </p>
                        <p>
                            The API is used solely for non-commercial, educational purposes in accordance with{' '}
                            <a href="https://developer.themoviedb.org/docs/faq" target="_blank"
                               rel="noopener noreferrer" className="tmdb-link">
                                TMDB API Terms of Use <LinkOutlined/>
                            </a>.
                        </p>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default About;
