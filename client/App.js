import React from 'react';
import {BrowserRouter as Router,Route,Link,Redirect,Switch} from 'react-router-dom';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import Auth from './modules/Auth';
import Home from './components/Home';
import Base from './components/Base';
import SignUpPage from './containers/SignUpPage';
import LoginPage from './containers/LoginPage';
import LogoutPage from './containers/LogoutPage';
import NotFoundPage from './containers/NotFoundPage';
import UploadForm from './components/UploadForm';
import './styles/App.css';

class App extends React.Component {
  render() {
    return (
      <MuiThemeProvider muiTheme={getMuiTheme()}>
        <Router>
          <div>
            <Base/>
            <Switch>
              <Route exact path='/' component={Home}/>
              <Route path='/signup' component={SignUpPage}/>
              <Route path='/login' component={LoginPage}/>
              <Route path='/logout' component={LogoutPage}/>
              <PrivateRoute path='/upload' component={UploadForm}/>
              <Route component={NotFoundPage}/>
            </Switch>
          </div>
        </Router>
      </MuiThemeProvider>
    );
  }
}

const PrivateRoute = ({ component: Component,path}) => (
  <Route path={path} render={props => (
    Auth.isUserAuthenticated() ? (
      <Component {...props}/>
    ) : (
      <Redirect to={{
        pathname: '/login',
        from: props.location,
        message:'You need to login to view this pages.'
      }}/>
    )
  )}/>
)
export default App;
