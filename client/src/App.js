import "./App.css"
import { Routes, Route } from "react-router-dom"
import Login from "./components/Authorization/Login"
import Register from "./components/Authorization/Register"
import Bookmarks from "./components/Bookmarks/Bookmarks"
import Comments from "./components/Comments/Comments"
import Forum from "./components/Forum/Forum"
import Genres from "./components/Genres/Genres"
import Rating from "./components/Rating/Rating"

function App() {
    return (
        <div className="App">
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/bookmarks" element={<Bookmarks />} />
                <Route path="/comments" element={<Comments />} />
                <Route path="/forum" element={<Forum />} />
                <Route path="/genres" element={<Genres />} />
                <Route path="/rating" element={<Rating />} />
            </Routes>
        </div>
    )
}

export default App
