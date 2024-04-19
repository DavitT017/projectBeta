import React from "react"
import "./App.css"
import { Routes, Route, NavLink } from "react-router-dom"
import Login from "./components/Authorization/Login"
import Register from "./components/Authorization/Register"
import Bookmarks from "./components/Bookmarks/Bookmarks"
import Comments from "./components/Comments/Comments"
import Forum from "./components/Forum/Forum"
import Genres from "./components/Genres/Genres"
import Rating from "./components/Rating/Rating"

function Home() {
    return (
        <React.Fragment>
            <h1>WELCOME TO PROJECT BETA</h1>
            <div>
                <NavLink to="/login">
                    <button>Login</button>
                </NavLink>
                <NavLink to="/register">
                    <button>Register</button>
                </NavLink>
                <NavLink to="/bookmarks">
                    <button>Bookmarks</button>
                </NavLink>
                <NavLink to="/comments">
                    <button>Comments</button>
                </NavLink>
                <NavLink to="/forum">
                    <button>Forum</button>
                </NavLink>
                <NavLink to="/genres">
                    <button>Genres</button>
                </NavLink>
                <NavLink to="/rating">
                    <button>Rating</button>
                </NavLink>
            </div>
        </React.Fragment>
    )
}

function App() {
    return (
        <div className="App">
            <Routes>
                <Route path="/" element={<Home />} />
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
