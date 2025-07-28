import React, {useState} from 'react';
import {Typography} from 'antd';
import {useNavigate} from 'react-router-dom';
import useMessage from 'antd/es/message/useMessage';
import axios from 'axios';
import './Interests.css';
import Logo from "../logo/Logo.tsx";

const {Text} = Typography;

const Interests: React.FC = () => {
    const navigate = useNavigate();
    const [customMessage, contextHolder] = useMessage();
    const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

    const interestsList: string[] = [
        'Sport', 'Fashion', 'Food', 'Space',
        'Art', 'Traveling', 'Literature', 'Humor', 'Music', 'Science'
    ];

    const toggleInterest = (interest: string) => {
        setSelectedInterests(prevState =>
            prevState.includes(interest)
                ? prevState.filter(item => item !== interest)
                : [...prevState, interest]
        );
    };

    const saveInterests = async () => {
        if (selectedInterests.length === 0) {
            customMessage.error('Choose at least one interest');
            return;
        }
        try {
            await axios.put(
                '/api/users/interests',
                selectedInterests,
                {withCredentials: true}
            );

            navigate('/account');
        } catch (error) {
            console.error('Failed to set interests:', error);
            customMessage.error('Failed to set interests. Please try again later.');
        }
    };

    return (
        <div className="container">
            {contextHolder}
            <Logo level={1}/>
            <Text className="subtitle">Tell us your interests</Text>
            <div className="buttons">
                {interestsList.map((interest) => (
                    <button
                        key={interest}
                        className={`interest-button ${selectedInterests.includes(interest) ? 'selected' : ''}`}
                        onClick={() => toggleInterest(interest)}
                    >
                        {interest}
                    </button>
                ))}
            </div>

            <Text className="subtitle-2">Don't worry, you can change it later</Text>
            <button className="home-button" onClick={saveInterests}>
                Save Interests
            </button>
        </div>
    );
};

export default Interests;
