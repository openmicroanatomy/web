import DownloadQuPathReminder from "components/DownloadQuPathReminder";
import { createBrowserHistory } from "history";
import Home from "pages/Home";
import { Route, Router, Switch } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "tailwindcss/tailwind.css";

const App = () => {
    const history = createBrowserHistory();

    return (
        <Router history={history}>
            <div className="App mx-auto font-mono h-screen flex flex-col">
                <ToastContainer />

                <DownloadQuPathReminder />

                <Switch>
                    <Route path="/">
                        <Home />
                    </Route>
                </Switch>
            </div>
        </Router>
    );
};

export default App;
