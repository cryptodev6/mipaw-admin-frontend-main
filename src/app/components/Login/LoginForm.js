"use client"
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function LoginForm() {
    const router = useRouter()
    const [error, setError] = useState(false);
    const [errormsg, setErrormsg] = useState(false);
     
    async function handleSubmit(event) {
        event.preventDefault();
        const formData = new FormData(event.currentTarget)
        const username = formData.get('username');
        const password = formData.get('password');
        (username=="" || password=="") ? (setError(true),setErrormsg('Username and Password is required')) : (setError(false),setErrormsg(false));

        router.push('/dashboard')
        /*const response = await fetch('/api/login/submitlogin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        })*/
        
        console.log(response,"#############");
        /*if (response.ok) {
          router.push('/profile')
        } else {
          // Handle errors
        }*/
       /* if(username=="admin" && password=="webwork@123"){
            cookies().set('admin_logged_in', true,{
                maxAge: 60 * 60 * 24 * 2, 
            })
            router.push('/dashboard');
        }
        else{
            setError(true);
            setErrormsg("Invalid Credentials");
        }*/
        console.log(username,password);
        return false;
    }

    return (
        <>
            <div className="login-wrapper p-5">
                <h1 className="text-center">Login Form</h1>  
                {
                    (error) && <p>{errormsg}</p>
                }
                <form action="" onSubmit={handleSubmit}>
                    <div className="form-group mb-3">
                        <label className="form-label">Username</label>
                        <input type="text" name="username" />
                    </div>
                    <div className="form-group mb-3">
                        <label className="form-label">Password</label>
                        <input type="password" name="password" />
                    </div>
                    <div className="form-group submit mb-3 text-center">
                        <input type="submit" name="Login" value="Login" className="btn btn-primary" />
                    </div>
                </form>
            </div>
        </>
    );
}
