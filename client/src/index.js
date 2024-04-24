import React, { createContext } from "react"
import ReactDOM from "react-dom/client"
import "./index.css"
import App from "./App"
import reportWebVitals from "./reportWebVitals"
import { BrowserRouter } from "react-router-dom"
import Store from "./store/store"

const store = new Store()

export const AuthorizationContext = createContext({ store })

const root = ReactDOM.createRoot(document.getElementById("root"))
root.render(
    <React.StrictMode>
        <AuthorizationContext.Provider value={{ store }}>
            <BrowserRouter>
                <App />
            </BrowserRouter>
        </AuthorizationContext.Provider>
    </React.StrictMode>
)

reportWebVitals()
