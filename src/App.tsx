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
                <div className="flex bg-blue-500 p-2 h-12 shadow-md">
                    <p className="text-white font-bold text-lg text-center my-0 mx-auto">
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
