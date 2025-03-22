import { useEffect, useState } from "react";
import axios from 'axios';
import { useDispatch } from "react-redux";
import { setUser } from "../store/userSlice";

function useAutoLogin() {
    const [loading, setLoading] = useState(true);
    const dispatch = useDispatch()

    useEffect(() => {
        (async function autoLoginApiCall() {
            try {

                const response = await axios.get(`${process.env.REACT_APP_INTERNAL_API_PATH}/refresh`, {
                    withCredentials: true
                })
    
                if(response.status === 200){
                            const user = {
                                _id: response.data.user._id,
                                email: response.data.user.email,
                                username: response.data.user.username,
                                auth: response.data.auth
                            }
                
                    dispatch(setUser(user));
                }

            } catch (error) {

            } finally{
                setLoading(false);
            }
            
        })()
    },[])

    return loading;
}

export default useAutoLogin;