import DownloadQuPathReminder from "components/DownloadQuPathReminder";
import EmbeddedProject from "components/EmbeddedProject";
import EmbeddedSingleSlide from "components/EmbeddedSingleSlide";
import { createBrowserHistory } from "history";
import Home from "pages/Home";
import { HashRouter, Route, Switch } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "tailwindcss/tailwind.css";

const App = () => {
    // TODO: Switch to other router when equipped with an server, currently server via nginx 
    const history = createBrowserHistory();

    return (
        <HashRouter hashType="hashbang"> { /* Switch to other router when equipped with an server, currently server via nginx */ }
            <div className="App mx-auto font-mono h-screen flex flex-col bg-slate-50">
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
};

export default App;
