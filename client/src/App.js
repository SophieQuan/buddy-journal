import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  createHttpLink,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import SingleJournal from "./pages/SingleJournal";
import "./App.css";

const httpLink = createHttpLink({
  uri: "/graphql",
});

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem("id_token");
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    },
  };
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

function App() {
  return (
    <ApolloProvider client={client}>
      <Router>
        <div>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/" element={<Home />} />
            <Route path="/journal/:id" element={<SingleJournal />} />
          </Routes>
        </div>
      </Router>
    </ApolloProvider>
  );
}

export default App;

// import React from "react";

// import Login from "./pages/Login";

// function App() {
//   return (
//     <>
//       <Login></Login>
//     </>
//   );
// }

// export default App;
