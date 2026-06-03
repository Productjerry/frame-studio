import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import AdminPage from "./pages/AdminPage.jsx";
import UserPage from "./pages/UserPage.jsx";

const router = createBrowserRouter([
  { path: "/", element: <Navigate to="/user" replace /> },
  { path: "/admin", element: <AdminPage /> },
  { path: "/user", element: <UserPage /> },
  { path: "*", element: <Navigate to="/user" replace /> },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
