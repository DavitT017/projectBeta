import React, { useContext, useEffect } from "react"
import "./App.css"
import { Routes, Route, NavLink } from "react-router-dom"
import Login from "./components/Authorization/Login"
import Register from "./components/Authorization/Register"
import Bookmarks from "./components/Bookmarks/Bookmarks"
import Forum from "./components/Forum/Forum"
import Genres from "./components/Genres/Genres"
import Rating from "./components/Rating/Rating"
import { AuthorizationContext } from "./index"
import { observer } from "mobx-react-lite"
import { ComicsList } from "./components/Comments/ComicsList"
import ComicsContextProvider from "./context/ComicsContext"
import Comics from "./components/Comments/Comics"

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
                <NavLink to="/comics">
                    <button>Comics</button>
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
            {store.isAuth ? (
                <p>{`User ${store.user.email} is authorized`}</p>
            ) : (
                <p>Please authorize</p>
            )}
            {store.isAuth && !store.user.isActivated ? (
                <p>Click on activation link in email</p>
            ) : null}

            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/registration" element={<Register />} />
                <Route path="/bookmarks" element={<Bookmarks />} />
                <Route path="/forum" element={<Forum />} />
                <Route path="/genres" element={<Genres />} />
                <Route path="/rating" element={<Rating />} />
                <Route path="/comics" element={<ComicsList />} />
                <Route
                    path="/comics/:comic_id"
                    element={
                        <ComicsContextProvider>
                            <Comics />
                        </ComicsContextProvider>
                    }
                />
            </Routes>

            {store.isAuth ? (
                <button onClick={() => store.logout()}>Log out</button>
            ) : null}
        </div>
    )
}

export default observer(App)
