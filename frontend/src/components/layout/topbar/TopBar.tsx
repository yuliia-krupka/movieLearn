import React, {useEffect, useState} from "react";
import {Layout, Avatar, Typography} from "antd";
import {useNavigate} from "react-router-dom";
import "./TopBar.css";
import axios from "axios";

const {Header} = Layout;
const {Text} = Typography;

interface User {
    name?: string;
    lastname?: string;
    photo?: string;
}

const TopBar: React.FC = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState<User | null>(null);
    useEffect(() => {
        axios.get('/api/users/account', {withCredentials: true})
            .then(res => setUser(res.data))
            .catch(error => console.log("ERROR OCCURRED: " + error))
    }, [])

    return (
        <Header className="topbar">
            <div className="topbar-right">
                <div className="topbar-user">
                    <Avatar
                        size="small"
                        src={user ? "http://localhost:8080/api/users/photo" : undefined}
                        icon={!user?.photo}
                        className="topbar-avatar"
                    />
                    <Text
                        strong
                        className="topbar-username"
                        onClick={() => navigate("/account")}
                    >
                        {user?.name} {user?.lastname}
                    </Text>
                </div>
            </div>
        </Header>

    );
};

export default TopBar;