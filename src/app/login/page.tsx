'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { authenticate } from '@/lib/actions-auth';
import { FiUser, FiLock, FiAlertCircle } from 'react-icons/fi';

export default function LoginPage() {
    const [errorMessage, dispatch] = useFormState(authenticate, undefined);

    const inputClass = "focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 block w-full pl-11 text-base border-gray-300 rounded-xl py-3 px-4 border text-gray-900 placeholder-gray-400 bg-white transition-all";
    const labelClass = "block text-sm font-semibold text-slate-700 mb-1.5";

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50/50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* SaaS background glow blobs */}
            <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-emerald-100/50 rounded-full filter blur-3xl -z-10" />
            <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-100/40 rounded-full filter blur-3xl -z-10" />

            <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
                <div className="inline-flex items-center justify-center p-3 bg-white border border-slate-200 shadow-md rounded-2xl mb-4">
                    <img src="/apple-icon.png" alt="Logo RVAT" className="w-12 h-12 object-contain" />
                </div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                    Acesso ao RVAT
                </h2>
                <p className="mt-1.5 text-sm text-slate-500 font-medium">
                    Preenchimento e gestão de relatórios de assistência
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-6 shadow-lg rounded-2xl border border-slate-150 sm:px-10">
                    <form action={dispatch} className="space-y-6" autoComplete="off">
                        {/* Email Input */}
                        <div>
                            <label htmlFor="email" className={labelClass}>
                                E-mail
                            </label>
                            <div className="relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                                    <FiUser size={18} />
                                </div>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="off"
                                    required
                                    className={inputClass}
                                    placeholder="exemplo@mocmaq.com"
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div>
                            <label htmlFor="password" className={labelClass}>
                                Senha
                            </label>
                            <div className="relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                                    <FiLock size={18} />
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="new-password"
                                    required
                                    className={inputClass}
                                    placeholder="******"
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div>
                            <LoginButton />
                        </div>

                        {/* Error Feedback */}
                        <div
                            className="flex h-8 items-center space-x-2"
                            aria-live="polite"
                            aria-atomic="true"
                        >
                            {errorMessage && (
                                <div className="flex items-center gap-1.5 text-sm text-red-600 font-semibold bg-red-50 p-3.5 w-full rounded-xl border border-red-100">
                                    <FiAlertCircle className="shrink-0" size={18} />
                                    <span>{errorMessage}</span>
                                </div>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

function LoginButton() {
    const { pending } = useFormStatus();

    return (
        <button
            type="submit"
            aria-disabled={pending}
            disabled={pending}
            className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-md text-base font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50 transition duration-150 ease-in-out cursor-pointer"
        >
            {pending ? 'Entrando...' : 'Entrar na Conta'}
        </button>
    );
}
