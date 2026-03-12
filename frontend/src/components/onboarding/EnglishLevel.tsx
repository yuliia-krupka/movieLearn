import {Button, Typography} from 'antd';
import {useNavigate} from 'react-router-dom';
import useMessage from 'antd/es/message/useMessage';
import {useAuth} from "../auth/useAuth.tsx";
import {type FC} from 'react';
import {userService} from "../../services/userService";
import "./EnglishLevel.css";
import Logo from "../shared/Logo.tsx";
import {englishLevels} from "../../constants/common.ts";
import LogoDesign from "../shared/LogoDesign.tsx";

const {Text} = Typography;

const EnglishLevel: FC = () => {
    const navigate = useNavigate();
    const {checkAuthStatus} = useAuth();
    const [customMessage, contextHolder] = useMessage();


    const handleLevelSelect = async (level: string): Promise<void> => {
        try {
            await userService.setLevel(level);
            await checkAuthStatus();
            navigate('/interests');
        } catch (error) {
            console.error('Failed to set level:', error);
            customMessage.error('Failed to set level. Please try again later.');

        }
    };

    return (
        <div className="container">
            {contextHolder}
            <LogoDesign className="logo-design-responsive"/>
            <Logo level={1}/>

            <Text className="subtitle">Tell us your level of English</Text>

            <div className="buttons">
                {englishLevels.map((level) => (
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
