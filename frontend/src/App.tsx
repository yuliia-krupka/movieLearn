import SignIn from "./components/signIn/SignIn.tsx";
import {BrowserRouter as Router, Routes, Route} from "react-router-dom";
import Account from "./components/account/Account.tsx";
import EnglishLevel from "./components/englishLevel/EnglishLevel.tsx";
import Interests from "./components/interests/Interests.tsx";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<SignIn/>}/>
                <Route path="/account" element={<Account/>}/>
                <Route path="/level" element={<EnglishLevel/>}/>
                <Route path="/interests" element={<Interests/>}/>
            </Routes>
        </Router>
    );
}


export default App
