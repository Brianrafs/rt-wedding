"use client";

import { useActionState, useState } from "react";
import { loginAction, type LoginState } from "@/actions/auth.actions";
import { control, primaryButton } from "@/components/ui/styles";

const initialState: LoginState = {};

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, initialState);
  const [username, setUsername] = useState("");
  return (
    <form className="mt-8 grid [&_label]:mt-4 [&_label]:text-xs [&_label]:font-bold" action={action} aria-describedby={state.error ? "login-error" : undefined}>
      <label htmlFor="username">Usuário</label>
      <input className={`${control} mt-1.5`} id="username" name="username" type="text" autoComplete="username" required maxLength={100} disabled={pending} value={username} onChange={(event) => setUsername(event.target.value)} />

      <label htmlFor="password">Senha</label>
      <input className={`${control} mt-1.5`} id="password" name="password" type="password" autoComplete="current-password" required maxLength={256} disabled={pending} />

      {state.error && <p className="mt-4 border-l-[3px] border-primary-hover bg-soft-lilac p-3 text-xs" id="login-error" role="alert">{state.error}</p>}
      <button className={`${primaryButton} mt-6`} type="submit" disabled={pending} aria-live="polite">{pending ? "Entrando..." : "Entrar"}</button>
    </form>
  );
}
