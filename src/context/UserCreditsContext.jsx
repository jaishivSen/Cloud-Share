import { useAuth } from "@clerk/clerk-react";
import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { createContext } from "react";
import { apiEndpoints } from "../util/apiEndpoints";
import toast from "react-hot-toast";

export const UserCreditsContext=createContext();

export const UserCreditsProvider=({children})=>{

    const[credits,setCredits]=useState(5);
    const[loading,setLoading]=useState(false);
    const{getToken,isSignedIn}=useAuth();

    const fetchUserCredits=useCallback(async()=>{
        if(!isSignedIn)return;
        setLoading(true);
        try {
            const token=await getToken();
            const  response=await axios.get(apiEndpoints.GET_CREDITS,{headers:{Authorization: `Bearer ${token}`}});
            if(response.status===200){
                setCredits(response.data.credits);
            }
            else{
                toast.error('Unable to get the credits.');
            }
        } catch (error) {
             console.error('Error fetching the use credits',error);
        }
        finally{
            setLoading(false);
        }
    },[getToken,isSignedIn]);

    useEffect(()=>{
       if(isSignedIn){
        fetchUserCredits();
       } 
    },[fetchUserCredits,isSignedIn]);

    const updateCredits=useCallback((newCredits) =>{
        console.log('Updating the credits',newCredits);
        setCredits(newCredits);
    },[]);

    const contextValue={
        credits,
        setCredits,
        fetchUserCredits,
        updateCredits
    }

    return (
        <UserCreditsContext.Provider value={contextValue}>
                {children}
        </UserCreditsContext.Provider>
    )
}