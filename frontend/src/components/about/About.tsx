import React from 'react';
import {MailOutlined} from '@ant-design/icons';
import MainLayout from '../layout/MainLayout';
import './About.css';
import Logo from "../shared/Logo.tsx";
import LogoDesign from "../shared/LogoDesign.tsx";


const About: React.FC = () => {
    return (
        <MainLayout>
            <div className="about-page">
                <div className="about-header">
                    <LogoDesign className="about-logo-design"/>
                    <Logo level={1}/>
                </div>

                <div className="about-section">
                    <h2>About the Project</h2>
                    <p>
                        MovieLearn is a non-commercial, educational application designed to help users improve their
                        English language skills by studying vocabulary from movie scripts. Users can generate
                        personalized flash cards and tests based on their own uploaded movie dialogues.
                    </p>
                </div>

                <div className="about-section">
                    <h2>User Uploaded Content</h2>
                    <p>
                        This platform operates on a user-centric model where individuals upload their own script files
                        for processing. By using this service, users consent to the processing of their English level
                        and interests to generate personalized learning materials, and confirm they have the right
                        to use the provided data for educational purposes.
                    </p>
                    <p>
                        All generated learning sets and uploaded movie scripts are private and tied exclusively to the
                        user who created them, ensuring personal data boundaries. Scripts are deleted immediately after
                        the learning set of flashcards is approved. We process this data solely to provide
                        the learning functionality.
                    </p>
                </div>

                <div className="about-section">
                    <h2>Personalized Learning</h2>
                    <p>
                        MovieLearn creates personalized learning experiences by analyzing your English proficiency level
                        and personal interests.
                        The system adapts vocabulary difficulty and content complexity to match your specific language
                        skills, ensuring that
                        learning materials are appropriately challenging for your level.
                    </p>
                    <p>
                        Your interests help generate relevant and engaging vocabulary examples from movie scripts,
                        making the learning process
                        more enjoyable and effective. This personalized approach ensures that each user receives a
                        unique learning experience
                        tailored to their specific needs and preferences.
                    </p>
                </div>

                <div className="about-section">
                    <h2>University Project</h2>
                    <p>
                        MovieLearn is a diploma project developed at
                        Vasyl Stefanyk Carpathian National University (CNU), Ivano-Frankivsk, Ukraine.
                        The project was created as part of a bachelor's degree program in Software Engineering.
                    </p>
                </div>

                <div className="about-section">
                    <h2>Contact</h2>
                    <p>If you have any questions, suggestions, or feedback, feel free to reach out:</p>
                    <div className="contact-list">
                        <a href="mailto:yuliavikakrupka@gmail.com" className="contact-item">
                            <MailOutlined/> yuliavikakrupka@gmail.com
                        </a>
                        <a href="mailto:yuliia.krupka.22@pnu.edu.ua" className="contact-item">
                            <MailOutlined/> yuliia.krupka.22@pnu.edu.ua
                        </a>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default About;
