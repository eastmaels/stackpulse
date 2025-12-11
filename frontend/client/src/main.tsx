import { createRoot } from "react-dom/client";
import { Connect } from "@stacks/connect-react";
import App from "./App";
import "./index.css";
import { userSession } from "./lib/stacks/user-session";

createRoot(document.getElementById("root")!).render(
  <Connect
    authOptions={{
      appDetails: {
        name: "StackPolls",
        icon: window.location.origin + "/favicon.png",
      },
      redirectTo: "/",
      onFinish: () => {
        window.location.reload();
      },
      userSession: userSession as any,
    }}
  >
    <App />
  </Connect>
);
