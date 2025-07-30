import {useEffect, useState} from "react";
import axios from "axios";
import {Button, Form, Input, Typography, Layout, Card} from "antd";
import {useNavigate} from "react-router-dom";
import Sidebar from "../layout/sidebar/Sidebar";
import TopBar from "../layout/topbar/TopBar";
import './Account.css';
import '../layout/Layout.css'
import useMessage from "antd/es/message/useMessage";

const {Content} = Layout;
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

    useEffect(() => {
        axios.get("/api/users/account", {withCredentials: true})
            .then(res => {
                const {name, lastname, englishLevel, interests}: UserData = res.data;
                form.setFieldsValue({name, lastname});
                setSelectedLevel(englishLevel);
                setSelectedInterests(interests || []);
            })
            .catch(err => {
                console.error("Failed to fetch user data:", err);
                customMessage.error('Failed to update profile.')
            });
    }, [customMessage, form]);

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

    const onFinish = (values: UserData) => {
        const updatedData: UserData = {
            ...values,
            englishLevel: selectedLevel,
            interests: selectedInterests
        };
        axios.put("/api/users/account/update", updatedData, {withCredentials: true})
            .then(() => navigate("/account"))
            .catch(err => console.error("Update failed:", err));
    };

    return (
        <Layout className="account-root-layout">
            <Sidebar/>
            <Layout>
                {contextHolder}
                <TopBar/>
                <Content className="content">
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
                </Content>
            </Layout>
        </Layout>
    );
};

export default UpdateAccount;
