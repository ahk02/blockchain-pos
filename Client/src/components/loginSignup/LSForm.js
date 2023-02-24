import React from "react";
import "./Form.css";
import Login from "./Login";
import Register from "./Register";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import SidebarData from './SidebarData'


function LSForm(props) {
  const { user, updateUser} = props;

  return (
    <div className="form">
    <div className="formMain">  	
		<input type="checkbox" id="chk" aria-hidden="true"/>
    
    <Router>
        <Switch>
          <Route path="/">
            {
              user && 1 ? <SidebarData/> : <><Register/><Login user={user} updateUser={updateUser}></Login></>
            }
          </Route>
        </Switch>
      </Router>		
	</div>
  </div>
  );
}

export default LSForm;
