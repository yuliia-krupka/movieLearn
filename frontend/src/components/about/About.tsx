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
                        for processing. By using this service and uploading content, users explicitly confirm they
                        have the right to use the provided data for educational purposes.
                    </p>
                    <p>
                        All generated learning sets and uploaded movie scripts are private and tied exclusively to the
                        user who created them, ensuring personal data boundaries. Scripts are deleted right after approving learning set of flashcards. We process this data solely to provide
                        the learning functionality.
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
