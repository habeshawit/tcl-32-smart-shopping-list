import React, { useState, useEffect } from 'react';
import './App.css';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  NavLink,
  Redirect,
} from 'react-router-dom';
import Home from './pages/Home';
import List from './pages/List';
import AddItem from './pages/AddItem';
import { getToken } from '@the-collab-lab/shopping-list-utils';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../src/lib/firebase';

function App() {
  const [userToken, setUserToken] = useState(null);

  useEffect(() => {
    getUserToken();
  }, [userToken]);

  function createTokenAndSaveToLocalStorage(userToken) {
    window.localStorage.setItem('userToken', getToken());
    getUserToken();
    submitTokenToDB();
  }

  const submitTokenToDB = async () => {
    const token = window.localStorage.getItem('userToken');
    await addDoc(collection(db, 'list'), {
      userToken: token,
    });
  };

  function useExistingTokenAndSaveToLocalStorage(token) {
    window.localStorage.setItem('userToken', token);
    getUserToken();
  }

  function getUserToken() {
    setUserToken(window.localStorage.getItem('userToken'));
  }

  return (
    <div className="App">
      <Router>
        {userToken && (
          <div className="linkContainerStyle">
            <NavLink activeClassName="active" className="navLink" to="/list">
              List
            </NavLink>
            <NavLink activeClassName="active" className="navLink" to="/additem">
              Add Item
            </NavLink>
          </div>
        )}
        <h1>Smart Shopping List</h1>
        <div className="linkContainerStyle">
          <NavLink activeClassName="active" className="navLink" to="/list">
            List
          </NavLink>
          <NavLink activeClassName="active" className="navLink" to="/additem">
            Add Item
          </NavLink>
        </div>

        <Switch>
          <Route exact path="/">
            {userToken ? (
              <Redirect to="/list" />
            ) : (
              <Home
                createTokenAndSaveToLocalStorage={
                  createTokenAndSaveToLocalStorage
                }
                getUserToken={getUserToken}
                useExistingTokenAndSaveToLocalStorage={
                  useExistingTokenAndSaveToLocalStorage
                }
              />
            )}
          </Route>
          <Route path="/list">
            {userToken ? <List /> : <Redirect to="/" />}
          </Route>
          <Route path="/additem">
            {userToken ? <AddItem /> : <Redirect to="/" />}
          </Route>
        </Switch>
      </Router>
    </div>
  );
}

export default App;
