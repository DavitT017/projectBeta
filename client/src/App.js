import React, { useContext, useEffect } from "react"
import "./App.css"
import { Routes, Route, NavLink } from "react-router-dom"
import Login from "./components/Authorization/Login"
import Register from "./components/Authorization/Register"
import Bookmarks from "./components/Bookmarks/Bookmarks"
import Comments from "./components/Comments/Comments"
import Forum from "./components/Forum/Forum"
import Genres from "./components/Genres/Genres"
import Rating from "./components/Rating/Rating"
import { AuthorizationContext } from "./index"
import { observer } from "mobx-react-lite"

function Home() {
    return (
        <React.Fragment>
            <h1>WELCOME TO PROJECT BETA</h1>
            <div>
                <NavLink to="/login">
                    <button>Login</button>
                </NavLink>
                <NavLink to="/registration">
                    <button>Registration</button>
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
    const { store } = useContext(AuthorizationContext)
    useEffect(() => {
        if (localStorage.getItem("token")) store.chechAuth()
    }, [store])

    return (
        <div className="App">
            {store.isAuth
                ? `User ${store.user.email} is authorized`
                : "Please authorize"}
            {store.user.isActivated
                ? "Click on activation link in email"
                : null}

            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/registration" element={<Register />} />
                <Route path="/bookmarks" element={<Bookmarks />} />
                <Route path="/comments" element={<Comments />} />
                <Route path="/forum" element={<Forum />} />
                <Route path="/genres" element={<Genres />} />
                <Route path="/rating" element={<Rating />} />
            </Routes>

            {store.isAuth ? (
                <button onClick={() => store.logout()}>Log out</button>
            ) : null}
        </div>
    )
}

export default observer(App)
