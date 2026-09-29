import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { signupAsync, useAppDispatch, useAppSelector } from "@/redux";
import getErrorText from "@/utils/typeErrorText";

const Register = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const loading = useAppSelector((state) => state.auth.loading);
    const [passwordConfirmation, setPasswordConfirmation] = useState("");

    const submit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const password = String(data.get("password") || "");
        if (password !== passwordConfirmation) return toast.error("Passwords do not match");
        try {
            await dispatch(signupAsync({
                name: String(data.get("name") || ""),
                email: String(data.get("email") || ""),
                password,
            })).unwrap();
            toast.success("Account created");
            navigate("/dashboard", { replace: true });
        } catch (error) {
            toast.error(getErrorText(error));
        }
    };

    return <main className="grid min-h-[70vh] place-items-center p-8">
        <form className="grid w-full max-w-md gap-4 rounded-2xl bg-surface p-8 shadow-[var(--shadow)]" onSubmit={submit}>
            <h1>Create your account</h1>
            <label className="grid gap-2">Name<input className="rounded-lg border border-input bg-background p-3 text-foreground" name="name" autoComplete="name" required minLength={2} /></label>
            <label className="grid gap-2">Email<input className="rounded-lg border border-input bg-background p-3 text-foreground" name="email" type="email" autoComplete="email" required /></label>
            <label className="grid gap-2">Password<input className="rounded-lg border border-input bg-background p-3 text-foreground" name="password" type="password" autoComplete="new-password" required minLength={8} /></label>
            <label className="grid gap-2">Confirm password<input className="rounded-lg border border-input bg-background p-3 text-foreground" type="password" autoComplete="new-password" required minLength={8} value={passwordConfirmation} onChange={(event) => setPasswordConfirmation(event.target.value)} /></label>
            <button className="rounded-lg bg-primary p-3 font-bold text-primary-foreground disabled:opacity-65" type="submit" disabled={loading}>{loading ? "Creating account…" : "Create account"}</button>
            <p>Already registered? <Link to="/auth/login">Sign in</Link></p>
        </form>
    </main>;
}

export default Register
