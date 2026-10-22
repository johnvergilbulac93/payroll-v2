import { Form, Head } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

import InputError from '@/components/input-error';
// import PasskeyVerify from '@/components/passkey-verify';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { store } from '@/routes/login';

type Props = {
    status?: string;
    canResetPassword: boolean;
};

export default function Login({ status }: Props) {
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
                className="flex flex-col gap-6"
                onError={handleError}
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-5">
                            <div className="grid gap-2">
                                <Label htmlFor="username" className="text-sm font-semibold text-foreground">Username</Label>
                                <Input
                                    id="username"
                                    type="text"
                                    name="username"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="username"
                                    placeholder="Username"
                                    className="h-12 rounded-lg border-border/80 bg-background px-4 text-left text-base shadow-sm transition-shadow placeholder:text-muted-foreground/70 focus-visible:ring-2 focus-visible:ring-ring/30"
                                />
                                <div className="text-center"><InputError message={usernameError} /></div>
                            </div>

                            <div className="grid gap-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password" className="text-sm font-semibold text-foreground">Password</Label>
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
                                    className="h-12 rounded-lg border-border/80 bg-background px-4 text-left text-base shadow-sm transition-shadow placeholder:text-muted-foreground/70 focus-visible:ring-2 focus-visible:ring-ring/30"
                                />
                                <div className="text-center"><InputError message={errors.password} /></div>
                            </div>

                            <div className="flex items-center space-x-3 rounded-lg border border-border/70 bg-muted/30 px-4 py-3">
                                <Checkbox
                                    id="remember"
                                    name="remember"
                                    tabIndex={3}
                                />
                                <Label htmlFor="remember" className="cursor-pointer text-sm font-medium text-muted-foreground">Remember me</Label>
                            </div>

                            <Button
                                type="submit"
                                className="mt-1 h-12 w-full justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground text-base font-semibold shadow-sm transition-all hover:bg-sidebar-primary/90 hover:shadow-md focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:ring-offset-2"
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
