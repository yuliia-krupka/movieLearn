import {useEffect, useState} from "react";
import axios from "axios";

type User = {
    name: string;
    email: string;
    profilePic?: string;
};

const Account = () => {
    const [user, setUser] = useState<User | null>(null);
    useEffect(() => {
        axios.get('/api/users/account', {withCredentials: true})
            .then(res => setUser(res.data))
            .catch(error => console.log("ERROR OCCURRED: " + error))
    }, [])
    return (
        <div>
            {user === null ? (
                <p>Loading...</p>
            ) : (
                <>
                    <p>Name: {user.name}</p>
                    <p>Email: {user.email}</p>
                    <img src="http://localhost:8080/api/users/photo" alt="Profile pic"/>
                </>
            )}
            hello!
        </div>
    );
}
export default Account;