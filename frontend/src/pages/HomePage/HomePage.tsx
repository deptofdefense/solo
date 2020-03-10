import React, { useCallback, useState } from "react";
import { useHistory } from "react-router-dom";
import useAuthContext from "context/AuthContext";
import { Button } from "solo-uswds";
import classes from "./HomePage.module.css";

const HomePage: React.FC = () => {
  const history = useHistory();
  const [taskId, setTaskId] = useState<null | string>(null);
  const { username, apiLogout, apiCall } = useAuthContext();

  const logoutUser = useCallback(async () => {
    await apiLogout();
    history.push("/postlogout");
  }, [apiLogout, history]);

  const createWorkerDebugMsg = useCallback(async () => {
    setTaskId(null);
    try {
      const { task_id: taskId } = await apiCall<{ task_id: string }>(
        "/workerlog/",
        {
          method: "POST",
          body: JSON.stringify({ msg: `worker debug message` })
        }
      );
      setTaskId(taskId);
    } catch (e) {
      setTaskId(e.toString());
    }
  }, [apiCall, setTaskId]);

  return (
    <div className={classes.root}>
      <h2>Protected Route</h2>
      <div>username: {username}</div>
      {taskId && <div>last task id: {taskId}</div>}
      <div>
        <Button onClick={logoutUser}>Logout</Button>
        <Button onClick={createWorkerDebugMsg}>
          Create worker debug message
        </Button>
      </div>
    </div>
  );
};

export default HomePage;
