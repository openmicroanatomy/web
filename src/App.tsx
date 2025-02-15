import Home from "pages/Home";
import { HashRouter, Route, Switch } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import EmbeddedSingleSlide from "./pages/EmbeddedSingleSlide";
import EmbeddedProject from "./pages/EmbeddedProject";

export default function App() {
    // TODO: Switch to other router when equipped with an server, currently server via nginx 
    // const history = createBrowserHistory();

    return (
        <HashRouter hashType="hashbang"> { /* Switch to other router when equipped with an server, currently server via nginx */ }
            <ToastContainer stacked />

            <Switch>
                <Route path="/embed/:host/:project/:slide">
                    <EmbeddedSingleSlide />
                </Route>

                <Route path="/embed/:host/:project">
                    <EmbeddedProject />
                </Route>

                <Route path="/">
                    <Home />
                </Route>
            </Switch>
        </HashRouter>
    );
}
