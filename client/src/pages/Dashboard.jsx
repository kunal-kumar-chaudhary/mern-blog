import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import DashSidebar from "../components/DashSidebar";
import DashProfile from "../components/DashProfile";
import DashPosts from "../components/DashPosts";
import DashUsers from "../components/DashUsers";
import DashComments from "../components/DashComments";
import DashboardComp from "../components/DashboardComp";

const Dashboard = () => {
  const location = useLocation();
  const [tab, setTab] = useState("");
  console.log(location.search);
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const tabFromUrl = urlParams.get("tab");
    if (tabFromUrl) {
      setTab(tabFromUrl); 
    }
  }, [location.search]);

  // now after getting the tab from url, we can use it do render different components inside dashboard
  // when user will click posts or profile, we will change the url and get the tab from url
  // and based on that we will render the component
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <div className="md:w-56">
        {/* sidebar */}
        <DashSidebar />
      </div>
        {/* profile */}
        {tab === "profile" && <DashProfile />}
        {/* posts */}
        {tab === "posts" && <DashPosts />}
        {/* users */}
        {tab === "users" && <DashUsers/>}
        {/* comments */}
        {tab === "comments" && <DashComments/>}
        {/* Dashboard */}
        {tab === "dash" && <DashboardComp/>}
    </div>
  );
};

export default Dashboard;
