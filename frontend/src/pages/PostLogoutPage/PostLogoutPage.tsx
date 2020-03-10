import React from "react";
import classes from "./PostLogoutPage.module.css";

const PostLoginPage: React.FC = () => (
  <div className={classes.root}>
    <h2>You have been logged out.</h2>
    <div>Close your browswer window</div>
  </div>
);

export default PostLoginPage;
