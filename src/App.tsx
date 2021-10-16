import { createBrowserHistory } from "history";
import { Route, Router, Switch } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "tailwindcss/tailwind.css";
import Home from "pages/Home";

const App = () => {
    const history = createBrowserHistory();

    return (
        <Router history={history}>
            <div className="App mx-auto font-mono h-screen bg-gray-100">
                <ToastContainer />
                <div className="bg-blue-500 p-2">
                    <p className="text-white font-bold text-lg text-center">
                        For the complete experience download QuPath Edu{" "}
                        <a href="#" className="underline">
                            here
                        </a>
                    </p>
                </div>

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
