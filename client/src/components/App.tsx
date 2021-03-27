import './App.scss';
import '@fortawesome/fontawesome-free/js/all';
import 'react-app-polyfill/ie11';
import React, { FC, useEffect } from 'react';
import { Redirect, Switch, Route, NavLink, useHistory } from 'react-router-dom';
import Modal from 'react-bootstrap/Modal';

import useGraphQL from '../hooks/useGraphQL';
import useSocket from '../hooks/useSocket';
import useGoogle from '../hooks/useGoogle';
import useQuery from '../hooks/useQuery';
import { useDispatch, useSelector, actions } from '../store';

import Dashboard from './Dashboard';
import Messenger from './Messenger';
import Cooking from './Cooking';
import Meeting from './Meeting';
import Career from './Career';

const apiURL =
  process.env.NODE_ENV === 'development'
    ? process.env.REACT_APP_API_URL_DEV
    : process.env.REACT_APP_API_URL_PROD;

const App: FC = () => {
  const { query } = useQuery();
  const history = useHistory();
  const dispatch = useDispatch();
  const { request, demo } = useGraphQL();
  const { authenticate, signout } = useGoogle();
  const { user, error } = useSelector((state) => state);

  // Create a WebSocket for the Slack API to stay connected when navigating the website
  const { loading, send } = useSocket();

  // Sign in the user either based on cookie or query.code provided by the redirect from Google Signin
  useEffect(() => {
    authenticate(query.code || '');
  }, [authenticate]); // eslint-disable-line

  // When the app initialises, check for last page visited
  useEffect(() => {
    try {
      const lastPage = localStorage.getItem('last_page');

      // If last page is found, navigate to it
      if (lastPage) history.push(lastPage);
    } catch (e) {}

    (window as any).graphQLRequest = request;

    demo();
  }, []); // eslint-disable-line

  // Store the page visited every time the pathname changes
  useEffect(() => {
    try {
      localStorage.setItem('last_page', history.location.pathname + history.location.search);
    } catch (e) {}
  }, [history, history.location.pathname, history.location.search]);

  return (
    <div className="App">
      <header>
        <NavLink to="/" className="logo">
          Luuk.gg
        </NavLink>

        <NavLink exact to="/">
          <i className="fas fa-th-large" /> Dashboard
        </NavLink>
        <NavLink to="/career">
          <i className="fas fa-code" /> Career
        </NavLink>
        <NavLink to="/cooking">
          <i className="fas fa-utensils" /> Cooking
        </NavLink>
        <NavLink to="/messenger">
          <i className="fab fa-slack" /> Messenger
        </NavLink>
        <NavLink to="/meeting">
          <i className="fas fa-video" /> Meeting
        </NavLink>
        {user ? (
          <div className="user-account">
            {!!user.picture && <img className="user-picture" src={user.picture} alt="" />}
            <span className="user-name">{user.name}</span>
            <span className="sign-out" onClick={() => signout()}>
              <i className="fas fa-sign-out-alt" />
            </span>
          </div>
        ) : (
          <a href={`${apiURL}/signin`} rel="noreferrer">
            <i className="fas fa-sign-in-alt" /> Sign in
          </a>
        )}
      </header>
      <main>
        <Switch>
          <Route path="/messenger">
            <Messenger loading={loading} send={send} />
          </Route>
          <Route path="/cooking">
            <Cooking />
          </Route>
          <Route path="/career">
            <Career />
          </Route>
          <Route path="/meeting">
            <Meeting />
          </Route>
          <Route exact path="/">
            <Dashboard />
          </Route>
          <Redirect to="/" />
        </Switch>
      </main>
      <Modal
        animation={false}
        className="modal"
        show={!!error}
        onHide={() => {
          dispatch(actions.set({ error: '' }));
        }}
      >
        <Modal.Header closeButton>An error occured</Modal.Header>
        <Modal.Body>
          <pre>{error}</pre>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default App;
