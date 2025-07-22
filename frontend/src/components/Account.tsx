import {useEffect, useState} from "react";
import axios from "axios";

const Account = () => {
    const [user, setUser] = useState(null);
    useEffect(() => {
        axios.get('http://localhost:8080/api/users/account', {withCredentials: true})
            .then(res => setUser(res.data))
            .catch(error => console.log("ERROR OCCURED: " + error))
    }, [])
    return (
        <div>
            {user === null ? (
                <p>Loading...</p>
            ) : (
                <>
                    <p>Name: {user.name}</p>
                    <p>Email: {user.email}</p>
                    {user.picture && <img src={user.picture}
                                          alt="User Profile"
                                          referrerPolicy="no-referrer"/>}
                </>
            )}
        </div>
    );
}

export default Account;