import React from "react";
import { useSelector } from "react-redux";
import { Outlet } from "react-router-dom";
import { Navigate } from "react-router-dom";

const OnlyAdminPrivateRoute = () => {
  // Outlet is a componet where child routes will be rendered
  const { currentUser } = useSelector((state) => state.user);
  return currentUser && currentUser.isAdmin ? <Outlet /> : <Navigate to="/sign-in" />;
};

export default OnlyAdminPrivateRoute;
