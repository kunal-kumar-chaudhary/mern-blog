import React from 'react'
import { useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Sidebar } from 'flowbite-react'
import { HiArrowSmRight, HiUser } from 'react-icons/hi'
import { signoutSuccess } from '../redux/user/userSlice'
import { useDispatch } from 'react-redux'
import { useSelector } from 'react-redux'

const DashSidebar = () => {
    const dispatch = useDispatch();
    const { currentUser } = useSelector((state) => state.user);
    const location = useLocation();
    const [tab, setTab] = useState("");
    useEffect(() => {
      const urlParams = new URLSearchParams(location.search);
      const tabFromUrl = urlParams.get("tab");
      if (tabFromUrl) {
        setTab(tabFromUrl);
      }
    }, [location.search]);
  

    const handleSignout = async (e)=>{
      e.preventDefault();
      try{
        const res = await fetch("/api/user/signout", {method: "POST"});
        const data = await res.json();
  
        if(!res.ok){
          console.log(data.message)
        }
        else{
          dispatch(signoutSuccess());
        }
      }
      catch(err){
        console.log(err.message);
      }
    }

  return (
    <Sidebar className='w-full md:w-56'>
        <Sidebar.Items>
            <Sidebar.ItemGroup>
                <Link to="/dashboard?tab=profile">
                <Sidebar.Item active={tab==="profile"} icon={HiUser} label={currentUser.isAdmin ? "Admin": "User"} labelColor="dark" as="div">
                     Profile
                </Sidebar.Item>
                </Link>
                <Sidebar.Item active icon={HiArrowSmRight} className="cursor-pointer" onClick={handleSignout}>
                     Sign Out
                </Sidebar.Item>
            </Sidebar.ItemGroup>
        </Sidebar.Items>
    </Sidebar>
  )
}

export default DashSidebar
