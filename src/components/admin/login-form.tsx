"use client";

import { useActionState, useState } from "react";
import { loginAction, type LoginState } from "@/actions/auth.actions";

const initialState: LoginState = {};

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, initialState);
  const [username, setUsername] = useState("");
  return (
    <form className="admin-login-form" action={action} aria-describedby={state.error ? "login-error" : undefined}>
      <label htmlFor="username">Usuário</label>
      <input id="username" name="username" type="text" autoComplete="username" required maxLength={100} disabled={pending} value={username} onChange={(event) => setUsername(event.target.value)} />

      <label htmlFor="password">Senha</label>
      <input id="password" name="password" type="password" autoComplete="current-password" required maxLength={256} disabled={pending} />

      {state.error && <p className="admin-form-error" id="login-error" role="alert">{state.error}</p>}
      <button type="submit" disabled={pending} aria-live="polite">{pending ? "Entrando..." : "Entrar"}</button>
    </form>
  );
}
