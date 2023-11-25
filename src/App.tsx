import EmbeddedProject from "components/EmbeddedProject";
import EmbeddedSingleSlide from "components/EmbeddedSingleSlide";
import Home from "pages/Home";
import { HashRouter, Route, Switch } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function App() {
    // TODO: Switch to other router when equipped with an server, currently server via nginx 
    // const history = createBrowserHistory();

    return (
        <HashRouter hashType="hashbang"> { /* Switch to other router when equipped with an server, currently server via nginx */ }
            <div className="App mx-auto h-full flex flex-col">
                <ToastContainer />

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
            </div>
        </HashRouter>
    );
}
