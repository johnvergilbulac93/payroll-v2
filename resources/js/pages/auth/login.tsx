import { Form, Head } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

import InputError from '@/components/input-error';
// import PasskeyVerify from '@/components/passkey-verify';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { register } from '@/routes';
import { store } from '@/routes/login';
import { request } from '@/routes/password';

type Props = {
    status?: string;
    canResetPassword: boolean;
};

export default function Login({ status, canResetPassword }: Props) {
    const [usernameError, setUsernameError] = useState('');
    const [countDown, setCountDown] = useState(0);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const startCountdown = () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }

        timerRef.current = setInterval(() => {
            setCountDown((prev) => {
                const next = prev > 0 ? prev - 1 : 0;

                if (next <= 0) {
                    if (timerRef.current) {
                        clearInterval(timerRef.current);
                    }

                    setUsernameError('');
                } else {
                    setUsernameError(
                        `Too many login attempts. Please try again in ${next} seconds.`,
                    );
                }

                return next;
            });
        }, 1000);
    };
    const handleError = (errors: Record<string, string>) => {
        setUsernameError(errors.username ?? '');
        const match = errors.username?.match(/(\d+)\s*seconds/);

        if (match) {
            setCountDown(parseInt(match[1], 10));
            startCountdown();
        }
    };
    useEffect(() => {
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, []);

    return (
        <>
            <Head title="Log in" />

            {/* Passkey Authentication */}
            {/* <PasskeyVerify /> */}
            <Form
                {...store.form()}
                resetOnSuccess={['password']}
                className="flex flex-col gap-7"
                onError={handleError}
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-7">
                            <div className="grid gap-3">
                                <Label htmlFor="username" className="text-base">Username</Label>
                                <Input
                                    id="username"
                                    type="text"
                                    name="username"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="username"
                                    placeholder="Username"
                                    className="h-12 px-4 text-base"
                                />
                                <InputError message={usernameError} />
                            </div>

                            <div className="grid gap-3">
                                <div className="flex items-center">
                                    <Label htmlFor="password" className="text-base">Password</Label>
                                    {/* {canResetPassword && (
                                        <TextLink
                                            href={request()}
                                            className="ml-auto text-sm"
                                            tabIndex={5}
                                        >
                                            Forgot your password?
                                        </TextLink>
                                    )} */}
                                </div>
                                <PasswordInput
                                    id="password"
                                    name="password"
                                    required
                                    tabIndex={2}
                                    autoComplete="current-password"
                                    placeholder="Password"
                                    className="h-12 px-4 text-base"
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="flex items-center space-x-3">
                                <Checkbox
                                    id="remember"
                                    name="remember"
                                    tabIndex={3}
                                />
                                <Label htmlFor="remember">Remember me</Label>
                            </div>

                            <Button
                                type="submit"
                                className="mt-4 h-12 w-full justify-center text-base text-center"
                                tabIndex={4}
                                disabled={processing || countDown > 0}
                                data-test="login-button"
                            >
                                {processing && <Spinner />}
                                Log in
                            </Button>
                        </div>

                        {/* <div className="text-center text-sm text-muted-foreground">
                            Don't have an account?{' '}
                            <TextLink href={register()} tabIndex={5}>
                                Sign up
                            </TextLink>
                        </div> */}
                    </>
                )}
            </Form>

            {status && (
                <div className="mb-4 text-center text-sm font-medium text-green-600">
                    {status}
                </div>
            )}
        </>
    );
}

Login.layout = {
    title: 'Log in to your account',
    description: 'Enter your username and password below to log in',
};
