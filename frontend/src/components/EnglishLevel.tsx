import {Button, Typography} from 'antd';
import axios from 'axios';
import {useNavigate} from 'react-router-dom';
import useMessage from 'antd/es/message/useMessage';
import {type FC} from 'react';
import "./css/EnglishLevel.css";
import Logo from "./Logo.tsx";

const {Text} = Typography;

const EnglishLevel: FC = () => {
    const navigate = useNavigate();
    const [customMessage, contextHolder] = useMessage();

    const levels: string[] = ['A1', 'A2', 'B1', 'B2', 'C1'];

    const handleLevelSelect = async (level: string): Promise<void> => {
        try {
            await axios.put(
                `/api/users/level/${level}`,
                {},
                {withCredentials: true}
            );
            navigate('/interests');
        } catch (error) {
            console.error('Failed to set level:', error);
            customMessage.error('Failed to set level. Please try again later.');

        }
    };

    return (
        <div className="container">
            {contextHolder}
            <Logo level={1}/>

            <Text className="subtitle">Tell us your level of English</Text>

            <div className="buttons">
                {levels.map((level) => (
                    <Button
                        key={level}
                        className="level-button"
                        onClick={() => handleLevelSelect(level)}
                    >
                        {level}
                    </Button>
                ))}
            </div>

            <Text className="subtitle-2">Don't worry, you can change it later</Text>
        </div>
    );
};

export default EnglishLevel;
