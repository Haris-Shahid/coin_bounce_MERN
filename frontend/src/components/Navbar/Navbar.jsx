import { NavLink } from "react-router-dom";
import styles from './Navbar.module.css';

import { useDispatch, useSelector } from "react-redux";
import { signout } from "../../api/internal";
import { resetUser } from "../../store/userSlice";

function Navbar() {
    const dispatch = useDispatch();
    const isAuthenticated = useSelector(state => state.user.auth);

    const handleSignOut = async () => {
        await signout();
        dispatch(resetUser());
    }

    return (
        <>
            <nav className={styles.navbar} >
                <NavLink to="/" className={`${styles.logo} ${styles.inActiveStyle}`} >Coinbounce</NavLink>

                <NavLink to="/" className={({ isActive }) => isActive ? styles.activeStyle : styles.inActiveStyle}  >Home</NavLink>

                <NavLink to="crypto" className={({ isActive }) => isActive ? styles.activeStyle : styles.inActiveStyle} >Cryptocurrencies</NavLink>

                <NavLink to="blogs" className={({ isActive }) => isActive ? styles.activeStyle : styles.inActiveStyle} >Blogs</NavLink>

                <NavLink to="submit" className={({ isActive }) => isActive ? styles.activeStyle : styles.inActiveStyle} >Submit a blog</NavLink>

                {
                    isAuthenticated ?
                        <div>
                            <NavLink>
                                <button onClick={handleSignOut} className={styles.signoutButton} >Sign Out</button>
                            </NavLink>
                        </div> :
                        <div>
                            <NavLink to="login" className={({ isActive }) => isActive ? styles.activeStyle : styles.inActiveStyle} >
                                <button className={styles.loginButton} >Log In</button>
                            </NavLink>

                            <NavLink to="signup" className={({ isActive }) => isActive ? styles.activeStyle : styles.inActiveStyle} >
                                <button className={styles.signupButton} >Sign Up</button>
                            </NavLink>
                        </div>
                }

            </nav>

            <div className={styles.separator} ></div>
        </>
    )
}

export default Navbar;