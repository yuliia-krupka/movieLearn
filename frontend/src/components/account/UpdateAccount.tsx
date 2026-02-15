import {useEffect, useState} from "react";
import {Button, Form, Input, Typography, Card, Spin, Alert} from "antd";
import {useNavigate} from "react-router-dom";
import MainLayout from "../layout/MainLayout.tsx";
import {useUserProfile} from "../hooks/useUserProfile.ts";
import '../css/Account.css';
import '../css/Layout.css'
import useMessage from "antd/es/message/useMessage";

const {Title} = Typography;

const interestsList: string[] = [
    "Sport", "Fashion", "Food", "Space",
    "Art", "Traveling", "Literature", "Humor", "Music", "Science"
];

const englishLevels = ["A1", "A2", "B1", "B2", "C1", "C2"];

type UserData = {
    name: string;
    lastname: string;
    englishLevel: string;
    interests: string[];
};

const UpdateAccount = () => {
    const [form] = Form.useForm<UserData>();
    const navigate = useNavigate();
    const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
    const [selectedLevel, setSelectedLevel] = useState<string>("");
    const [customMessage, contextHolder] = useMessage();
    const {user, loading, error, fetchUserProfile, updateUserProfile} = useUserProfile();

    useEffect(() => {
        fetchUserProfile();
    }, [fetchUserProfile]);

    useEffect(() => {
        if (user) {
            form.setFieldsValue({
                name: user.name,
                lastname: user.lastname,
            });
            setSelectedLevel(user.englishLevel);
            setSelectedInterests(user.interests || []);
        }
    }, [user, form]);

    const toggleInterest = (interest: string) => {
        setSelectedInterests(prev =>
            prev.includes(interest)
                ? prev.filter(i => i !== interest)
                : [...prev, interest]
        );
    };

    const onLevelSelect = (level: string) => {
        setSelectedLevel(level);
    };

    const onFinish = async (values: UserData) => {
        const updatedData: UserData = {
            ...values,
            englishLevel: selectedLevel,
            interests: selectedInterests
        };

        try {
            await updateUserProfile(updatedData);
            customMessage.success('Profile updated successfully');
            setTimeout(() => navigate("/account"), 1000);
        } catch (err) {
            customMessage.error('Failed to update profile.');
        }
    };

    if (loading && !user) {
        return (
            <MainLayout messageContext={contextHolder}>
                <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh'}}>
                    <Spin size="large"/>
                </div>
            </MainLayout>
        );
    }

    if (error && !user) {
        return (
            <MainLayout messageContext={contextHolder}>
                <Alert message="Error" description={error} type="error" showIcon style={{margin: 24}}/>
            </MainLayout>
        );
    }

    return (
        <MainLayout messageContext={contextHolder}>
            <div className="profile-container">
                <Title level={3} style={{margin: 24, textAlign: 'center'}}>
                    Update Profile
                </Title>
                <Card className="profile-card" style={{textAlign: 'center'}}>
                    <Form form={form} layout="vertical" onFinish={onFinish}>
                        <Form.Item
                            label="Name"
                            name="name"
                            rules={[
                                {required: true, message: 'Please input your name!'},
                                {min: 2, message: 'Name must be at least 2 characters.'},
                                {
                                    pattern: /^[A-Za-zА-Яа-яЇїІіЄєҐґ'\s-]+$/,
                                    message: 'Name can contain only English or Cyrillic letters, apostrophes, hyphens, and spaces.',
                                },
                            ]}
                        >
                            <Input/>
                        </Form.Item>


                        <Form.Item
                            label="Surname"
                            name="lastname"
                            rules={[
                                {required: true, message: 'Please input your lastname!'},
                                {min: 2, message: 'Name must be at least 2 characters.'},
                                {
                                    pattern: /^[A-Za-zА-Яа-яЇїІіЄєҐґ'\s-]+$/,
                                    message: 'Name can contain only English or Cyrillic letters, apostrophes, hyphens, and spaces.',
                                },
                            ]}
                        >
                            <Input/>
                        </Form.Item>


                        <Form.Item label="English Level">
                            <div className="levels-container">
                                {englishLevels.map(level => (
                                    <button
                                        key={level}
                                        type="button"
                                        className={`level-bullet ${selectedLevel === level ? "selected" : ""}`}
                                        onClick={() => onLevelSelect(level)}
                                        aria-pressed={selectedLevel === level}
                                    >
                                        {level}
                                    </button>
                                ))}
                            </div>
                        </Form.Item>

                        <Form.Item label="Interests">
                            <div className="interests-container">
                                {interestsList.map(interest => (
                                    <button
                                        key={interest}
                                        type="button"
                                        className={`interest-badge ${selectedInterests.includes(interest) ? "selected" : ""}`}
                                        onClick={() => toggleInterest(interest)}
                                    >
                                        {interest}
                                    </button>
                                ))}
                            </div>
                        </Form.Item>

                        <Form.Item>
                            <Button
                                htmlType="submit"
                                className="update-profile-btn"
                            >
                                Save Changes
                            </Button>
                        </Form.Item>
                    </Form>
                </Card>
            </div>
        </MainLayout>
    );
};

export default UpdateAccount;
