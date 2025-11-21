/*##################################################################################################################################################
####################################################################################################################################################
################################################################    LOGIC WRITTEN BY KAVIJA DULMITH    #############################################
###############################################################   FRONT-END WRITTEN BY SINETH DINSARA   ############################################ 
################################################################             28/08/2025                #############################################
####################################################################################################################################################
####################################################################################################################################################*/

'use client'
import { useState, useRef } from 'react';
import Image from 'next/image';
import Swal from 'sweetalert2';
import { useRouter } from 'next/navigation';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const router = useRouter();

    const usernameRef = useRef(null);
    const passwordRef = useRef(null);
    const signInButtonRef = useRef(null);

    const handleUsernameKeyDown = (e) => {
        if (e.key === 'Enter') {
            passwordRef.current.focus();
        }
    };

    const handlePasswordKeyDown = (e) => {
        if (e.key === 'Enter') {
            signInButtonRef.current.focus();
        }
    };

    const handleLogin = async () => {

        if (!username || !password) {
            Swal.fire({
                icon: 'error',
                title: 'Login Failed',
                text: 'Please enter both username and password',
                confirmButtonColor: '#d33',
                confirmButtonText: 'Try Again'
            });
            return;
        }

        const formData = new FormData();
        formData.append('userName', username);
        formData.append('userPwd', password);

        const res = await fetch("/api/user", {
            method: 'POST',
            body: formData
        });

        const data = await res.json();

        console.log(data);

        if (res.ok && (data.success === true)) {
            Swal.fire({
                icon: 'success',
                title: 'Login Successful!',
                text: `Welcome back, ${username}!`,
                confirmButtonColor: '#28a745',
                confirmButtonText: 'Continue'
            }).then((result) => {
                if (result.isConfirmed) {
                    router.push("/"); // replaced redirect() with client-side push
                }
            });
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Login Failed',
                text: 'Invalid username or password. Please try again.',
                confirmButtonColor: '#d33',
                confirmButtonText: 'Try Again'
            });
        }
    };

    const handleSignInKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleLogin();
        }
    };

    return (
        <div className="select-none h-screen bg-gray-100 flex items-center justify-center text-left text-base text-black bg-white">
            {/* Background */}
            <div className="absolute top-0 left-0 h-screen bg-[var(--burlywood)] w-full sm:w-1/2 h-full" />

            <form onSubmit={(e) => e.preventDefault()} className="relative w-full top-[0px] max-w-[539px] z-10 bg-white shadow-[0px_4px_35px_rgba(0,_0,_0,_0.08)] rounded-[40px] p-6 sm:p-8 mx-4 sm:mx-6 border border-gray-400">
            
                <div className="mb-6 sm:mb-8 text-lg sm:text-xl">
                    <span>Welcome to </span>
                    <span className="font-semibold text-[#ff0000]">"GLOBAL POS"</span>
                </div>

                {/* Heading */}
                <div className="text-[clamp(1.5rem,5vw,2.5rem)] font-medium mb-6 sm:mb-8">Sign in</div> 

                <div className="mb-4 sm:mb-6">
                    <label className="block mb-2 text-sm sm:text-base">Enter your Username</label>
                    <input
                        ref={usernameRef}
                        type="text"
                        placeholder="Username or email address"
                        value={username}
                        name='userName'
                        onChange={(e) => setUsername(e.target.value)}
                        onKeyDown={handleUsernameKeyDown}
                        autoFocus
                        className="w-full rounded-[9px] border border-dodgerblue px-3 py-2 text-sm font-light text-black focus:outline-none focus:ring-2 focus:ring-dodgerblue"/>
                </div>

                <div className="mb-4 sm:mb-6">
                    <label className="block mb-2 text-sm sm:text-base">Enter your Password</label>
                    <input
                        ref={passwordRef}
                        type="password"
                        placeholder="Password"
                        value={password}
                        name='userPwd'
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyDown={handlePasswordKeyDown}
                        className="w-full rounded-[9px] border border-dodgerblue px-3 py-2 text-sm font-light text-black focus:outline-none focus:ring-2 focus:ring-dodgerblue"/>
                </div>

                <div>
                    <button 
                        type='button'
                        ref={signInButtonRef}
                        onClick={handleLogin}
                        onKeyDown={handleSignInKeyDown}
                        className="w-full rounded-[10px] bg-[var(--darkorange)] text-white font-medium py-2 sm:py-3 text-sm sm:text-base shadow-[0px_4px_19px_rgba(119,_147,_65,_0.3)] cursor-pointer">
                        Sign in
                    </button>
                </div>
            </form>

            {/* Images */}
            <Image
                className="absolute top-[68px] sm:top-[calc(285/900*100vh)] left-[calc(1920/2px)] sm:left-[calc(192/1440*100vw)] w-[clamp(150px,18vw,269px)] h-[clamp(150px,18vw,256px)] object-contain"
                alt=""
                src="/Saly-3.png"
                width={269}
                height={256}
            />

            <Image
                className="absolute top-[calc(200/900*100vh)] left-[calc(937/1440*100vw)] w-[clamp(200px,25vw,450px)] h-[clamp(200px,25vw,450px)] object-cover hidden sm:block"
                alt=""
                src="/Saly-2.png"
                width={269}
                height={256}
            />

            <Image
                className="absolute top-4 left-4 w-[40px] sm:w-[50px] object-cover"
                alt="Logo"
                src="/globallogo.png"
                width={71}
                height={75}
            />

        </div>
    );
}

// LOGIN PAGE DONE AND DUSTED 28-08-2025
