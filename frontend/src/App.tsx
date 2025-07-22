import SignIn from "./components/SignIn.tsx";
import {BrowserRouter as Router, Routes, Route} from "react-router-dom";
import Account from "./components/Account.tsx";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<SignIn/>}/>
                <Route path="/account" element={<Account/>}/>
            </Routes>
        </Router>
    );
}


export default App
